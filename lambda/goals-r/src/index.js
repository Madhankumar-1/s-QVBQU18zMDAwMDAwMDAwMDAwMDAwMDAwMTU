//Globals
import responseTypes from "./responseTypes";
import schema from "./inputs/schema/schema";
import { withMiddleware } from "./middleware";
import { readSingleItem } from "@cny-src/serverless.aws.lambda/db";
import { responseBuilder, requestHeaderValidator, CustomException } from "@cny-src/serverless.aws.lambda/validator";

const { DEFAULT_DYNAMODB_TABLE_NAME, STAGE } = process.env;
const PK_DEFAULT = "dummy";
const SK_DEFAULT = "dummy";
let method;

export const myHandler = async (event) => {
     method = event.requestContext.http.method;
     console.log(event);
     const response = await dispatcher(event, method);

     return responseBuilder({ response: responseTypes.REQUEST_SUCCESS, data: { data: response }, method });
};

const dispatcher = async (request, method) => {
     let { headers } = request;

     headers = await requestHeaderValidator({ headers, method, schema, responseTypes });

     const TableName = DEFAULT_DYNAMODB_TABLE_NAME;

     let data;

     const response = await readSingleItem({
          TableName,
          pk: `${PK_DEFAULT}`,
          sk: `${SK_DEFAULT}`,
     });

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }

     if (!response.Item) {
          data = {};
     } else {
          console.log(data);
          data = response.Item.data;
     }

     return data;
};

export const handler = withMiddleware(myHandler, responseTypes);
