import { AwsClient } from 'aws4fetch'
export interface Env {
	ACCESS_KEY: string;
	ACCESS_KEY_ID: string;
	ENDPOINT: string;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Lets cache requests, I guess.
		const cache = caches.default

		// Convert the incoming url into the URL type for convenience
		let url = new URL(request.url);

		// Stop browsers from getting favicon or whatever so they don't pollute logs
		if(url.pathname == "/favicon.ico") {
			return new Response("", {status: 418});
		}

		// Create our url from the endpoint by combining the protocol, the endpoint url, and the path.
		let endpoint = new URL("https://"+env.ENDPOINT+url.pathname);
		
		// Store the endpoint for reuse
		let key = new Request(endpoint);
		
		// Check the cache for the url
		let response = await cache.match(key);

		// Cache
		if(!response) {
			console.log(`No data in cache for: ${endpoint}.`);
			// Construct client
			let aws = new AwsClient({
				"accessKeyId": env.ACCESS_KEY_ID,
				"secretAccessKey": env.ACCESS_KEY,
				"service": "s3",
			});

			let signed = await aws.sign(endpoint);
			response = await fetch(signed);

			// Make the headers mutable.
			response = new Response(response.body, response);
			response.headers.set("Cache-Control", "s-maxage=10");
			
			// Shove it in cache
			ctx.waitUntil(cache.put(key, response.clone()));
		} else {
			console.log(`Cache hit for: ${endpoint}.`);
		}
		return response;
	},
};
