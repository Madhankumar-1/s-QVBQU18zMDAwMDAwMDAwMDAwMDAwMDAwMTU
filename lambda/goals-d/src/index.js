//Globals
import { responseBuilder, requestHeaderValidator, CustomException } from "@cny-src/serverless.aws.lambda/validator";
import { deleteItem } from "@cny-src/serverless.aws.lambda/db";
import schema from "./inputs/schema/schema";
import responseTypes from "./responseTypes";
import { withMiddleware } from "./middleware";

const { DEFAULT_DYNAMODB_TABLE_NAME, STAGE } = process.env;
const PK_DEFAULT = "dummy";
const SK_DEFAULT = "dummy";
let method;

export const myHandler = async (event) => {
     method = event.requestContext.http.method;
     console.log(event);
     const response = await dispatcher(event, method);

     return responseBuilder({ response: responseTypes.REQUEST_SUCCESS, data: { data: response } }, method);
};

const dispatcher = async (request, method) => {
     let { headers, pathParameters } = request;

     headers = await requestHeaderValidator({ headers, method, schema, responseTypes });

     const TableName = DEFAULT_DYNAMODB_TABLE_NAME;

     const { pk = PK_DEFAULT, sk = SK_DEFAULT } = pathParameters

     let response = await deleteItem({ TableName, pk, sk });

     if (response.message === "ConditionalCheckFailedException") {
          throw new CustomException({ ...responseTypes.NOT_FOUND, method });
     }

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }

     return;
};

export const handler = withMiddleware(myHandler, responseTypes);
