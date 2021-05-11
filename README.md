# Barnes Collection Online

This project is a virtual gallery of the Barnes Foundation collection of artworks.  It was bootstrapped using [Create React App](https://github.com/facebookincubator/create-react-app) and is currently deployed on AWS Elastic Beanstalk and makes use of the following technical stack
- React/Redux for the front end of the site
- NodeJS Express server for the backend API and serving the site build
- ElasticSearch for the database of artwork records and their corresponding meta data
- Imgix for caching/CDN of the artwork images and tile images. The source image repository itself is an AWS S3 bucket
- Gulp for bundling and generating a ZIP file containing the site artifacts

Since the site only does *read* operations from the ElasticSearch database, we use the production instance for our local and development environments as well.

## Requirements

To be able to run this project for local development, your environment will necessitate the following
- NPM/Node (v10.19.0)

Please install the above prior to proceeding further.

## Installation

Clone this repository into your local environment

`git clone https://github.com/BarnesFoundation/Barnes-Online-Collection.git`

Install the necessary dependencies

`npm ci`

Copy the `.env` file and populate it with the correct values

The `npm run start-dev` command will start the backend API server and the frontend development server both in parallel. This is so that changes can be made to either part and be compiled on the fly.

Once the local server is running, you will need to generate `searchAssets.json` by running

`curl http://localhost:4002/api/build-search-assets`

## Deployment

As described earlier, this project is meant for deployment on AWS Elastic Beanstalk. It is served on the prebuilt NodeJS platform. 

Deployments are done via the AWS Elastic Beanstalk Console through uploading a ZIP file containing the compiled code of this repository.

Run the below command to generate the file 

```
npm run build
```

This newly created file, called `dist.zip` is generated by a gulp script contained at the root of this repository -- `gulpfile.js`.
It is the `postbuild` command in `package.json`  that executes the gulpfile.

After executing the command, the `dist.zip` is built and ready to be uploaded to Elastic Beanstalk for deploying to the site.

## Backend API Server

As described earlier, the backend API server is built using an Express server written in NodeJS.  

It is possible -- if needed -- to require basic HTTP authentication for a deployment instance of the site. This would come in handy  with a development or testing instance of the site that you don't want accessible to the public but still deployed publicly. 

To achieve this, you just need to create a `.htpasswd` file with username and encrypted password using the `htpasswd` program.


### Useful API Endpoints
This server wraps all calls to Elasticsearch in its own HTTP API. It uses the `elasticsearch` npm module and returns json unless otherwise noted. Some useful routes are:

- `GET /health` health check that the API is up.

- `GET /api/objects/:object_id` returns json of the art object matching the `:object_id`

- `GET /api/search` returns 10 art objects matching a query `q`, which is formatting according to [this documentation](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/api-reference.html#api-search)

- `GET /api/related` gets json of related objects to a given object. It takes two query parameters - `objectID` and `dissimilarPercent`. `dissimilarPercent` should be a number between 0 and 100.

- `GET /api/latestIndex` grabs the name of the latest complete elasticsearch index.

### Related objects

The meat of the logic of getting related objects is in the [getDistance](https://github.com/BarnesFoundation/barnes-collection-www/blob/master/server/app.js#L338-L364) function called in [server/app.js#L378-L413](https://github.com/BarnesFoundation/barnes-collection-www/blob/master/server/app.js#L378-L413). This function takes two objects, and calculates a euclidean-ish distance between them.

1. Grab 1000 objects from elasticsearch that have at least one field in `MORE_LIKE_THIS_FIELDS` in common with `objectID`
2. Iterate through all `MORE_LIKE_THIS_FIELDS`, and sum the distances using `getDistance`
3. Return random selection of (n * dissimilarPercent) of the furthest objects, and (n * (100 - dissimilarPercent)) of the closest objects.

For keys that are known to be numbers, we just calculate their distance. If the first person in the `people` descriptor don't match, we add 100 to the absolute distance. This makes it so we bias towards similar artists.

Its a very naive approach but works well with the current collection, and much better than elasticsearch's default more_like_this query (which makes it difficult to do 'dissimilar' objects).



## Sitemap generation

The `npm run build-sitemap` helper script re-generates the sitemap.xml file. The script hits the api endpoint and uses the data to template the file. Because the barnes collection never or rarely changes, this should not need to be run regularly.

This project assumes you have a separate Elasticsearch instance with the collection data and an S3 bucket with the images, following the [Flickr](https://www.flickr.com/services/api/misc.urls.html) convention.
