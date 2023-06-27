import { AwsClient } from 'aws4fetch'
export interface Env {
	access_key: string;
	access_key_id: string;
	endpoint: string;
	duration: string;
	bucket: BucketList;
}

type BucketList = {
	[key: string]: Bucket
}

type Bucket = {
	duration: string
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		let duration = env.duration;
		// Lets cache requests, I guess.
		let cache = caches.default

		// Convert the incoming url into the URL type for convenience
		let url = new URL(request.url);

		// Stop browsers from getting favicon or whatever so they don't pollute logs
		if(url.pathname == "/favicon.ico") {
			return new Response("", {status: 418});
		}

		let bucket: string = url.pathname.split("/")[1];

		if(!bucket) {
			return new Response(JSON.stringify({"message": "unexpected path length"}), {status: 400})
		} else if (bucket in env.bucket){
			cache = await caches.open("buckets:"+bucket);
			duration = env.bucket[bucket].duration;
		}
		
		// Create our url from the endpoint by combining the protocol, the endpoint url, and the path.
		let endpoint = new URL("https://"+env.endpoint+url.pathname);
		
		// Store the endpoint for reuse
		let key = new Request(endpoint);
		
		// Check the cache for the url
		let response = await cache.match(key);

		// Cache
		if(!response) {
			console.log(`No data in cache for: ${endpoint}.`);
			// Construct client
			let aws = new AwsClient({
				"accessKeyId": env.access_key_id,
				"secretAccessKey": env.access_key,
				"service": "s3",
			});

			let signed = await aws.sign(endpoint);
			response = await fetch(signed);

			// Make the headers mutable.
			response = new Response(response.body, response);
			response.headers.set("Cache-Control", "s-maxage="+duration);
			
			// Shove it in cache
			ctx.waitUntil(cache.put(key, response.clone()));
		} else {
			console.log(`Cache hit for: ${endpoint}.`);
		}
		return response;
	},
};
