# S3-Proxy
## A minimal simple cloudflare worker for proxying s3 get requests through cloudflare workers.

## Usage
Update the variables in wrangler.toml with the following information.

`ENDPOINT`, the url endpoint of where your s3 store is located, region included.

`ACCESS_KEY_ID`, the ID of your Access Key

`ACCESS_KEY`, your actual Access Key.

Then deploy it to cloudflare using wrangler.