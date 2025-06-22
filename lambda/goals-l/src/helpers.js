export function tranformResponse(items) {
     const transformedArray = [];

     items.forEach((item) => {
          transformedArray.push(item.data);
     });
     console.log(transformedArray);
     return transformedArray;
}
