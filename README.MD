# S3-Proxy
A minimal simple cloudflare worker for proxying s3 get requests through cloudflare workers.

## Usage
Update the variables in wrangler.toml with the following information.

```toml
[vars]
endpoint = "ENDPOINT" # The endpoint you are located at. IE: "s3.example.com"
access_key_id = "ACCESS_KEY_ID" # Your access key's ID
access_key = "ACCESS_KEY" # The access key itself. (You can also add this with wrangler secrets.)
duration = "300" # How long in seconds cloudflare should cache these files.
```

You may also add a per bucket option within the wrangler.toml like so:

```toml
# An example bucket
[vars.bucket.attachments]
# Duration in seconds
duration = "300"
```

Then deploy it to cloudflare using wrangler.