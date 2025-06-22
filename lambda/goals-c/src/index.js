//Globals
import {
     responseBuilder,
     requestHeaderValidator,
     CustomException,
     requestBodyValidator,
} from "@cny-src/serverless.aws.lambda/validator";
import { createSingleItem } from "@cny-src/serverless.aws.lambda/db";
import schema from "./inputs/schema/schema";
import responseTypes from "./responseTypes";
import { withMiddleware } from "./middleware";

let { DEFAULT_DYNAMODB_TABLE_NAME } = process.env;
let method;

export const myHandler = async (event) => {
     method = event.requestContext.http.method;
     const response = await dispatcher(event, method);
     return responseBuilder({ response: responseTypes.REQUEST_SUCCESS, data: { data: response } }, method);
};

const dispatcher = async (request, method) => {
     let { headers, body } = request;
     headers = await requestHeaderValidator({ headers, method, schema, responseTypes });
     body = await requestBodyValidator({ body, method, schema, responseTypes });

     const TableName = DEFAULT_DYNAMODB_TABLE_NAME;
     const { pk, sk } = body

     let response = await createSingleItem({
          TableName,
          pk,
          sk,
          data: { ...body },
     });

     if (response.message === "ConditionalCheckFailedException") {
          throw new CustomException({ ...responseTypes.DATA_ALREADY_EXISTS, method });
     }

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }

     return;
};

export const handler = withMiddleware(myHandler, responseTypes);
