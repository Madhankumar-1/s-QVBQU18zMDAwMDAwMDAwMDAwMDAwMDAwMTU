//Globals
import { responseBuilder, requestHeaderValidator, CustomException } from "@cny-src/serverless.aws.lambda/validator";
import { readMultipleItem } from "@cny-src/serverless.aws.lambda/db";
import { withMiddleware } from "./middleware";
import { tranformResponse } from "./helpers";
import responseTypes from "./responseTypes";
import schema from "./inputs/schema/schema";

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
     let { headers } = request;

     headers = requestHeaderValidator({ headers, method, responseTypes, schema });

     let sk = `${SK_DEFAULT}`;

     const TableName = DEFAULT_DYNAMODB_TABLE_NAME;
     let data = { count: 0, items: [] };

     let kv = { pk: `${PK_DEFAULT}`, sk };
     let exp = "#pk = :pk and begins_with( sk , :sk ) ";

     let response = await readMultipleItem({ TableName, kv, exp });

     if (response.error) {
          throw new CustomException({ ...responseTypes.DATABASE_ERROR, data: response.error, method });
     }
     if (response.Items.length === 0) {
     } else {
          const transformedResponse = tranformResponse(response.Items);
          data.count = transformedResponse.length;
          data.items = transformedResponse;
     }

     return data;
};

export const handler = withMiddleware(myHandler, responseTypes);
