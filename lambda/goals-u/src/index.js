//Globals
import schema from "./inputs/schema/schema";
import responseTypes from "./responseTypes";
import {
     responseBuilder,
     requestHeaderValidator,
     CustomException,
     requestBodyValidator,
} from "@cny-src/serverless.aws.lambda/validator";
import { updateData } from "@cny-src/serverless.aws.lambda/db";
import { withMiddleware } from "./middleware";

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
     let { headers, body } = request;

     headers = await requestHeaderValidator({ headers, method, schema, responseTypes });
     body = await requestBodyValidator({ body, method, schema, responseTypes });

     const TableName = DEFAULT_DYNAMODB_TABLE_NAME;

     console.log(body);

     let response = await updateData({
          TableName,
          pk: `${PK_DEFAULT}`,
          sk: `${SK_DEFAULT}`,
          data: body,
     });

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }
     return response;
};

export const handler = withMiddleware(myHandler, responseTypes);
