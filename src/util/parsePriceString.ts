
export function parsePriceString(currency:String | null){
    if(currency){
        return Number(currency.replace(/[^0-9.-]+/g,""));
    }else{
        return 0; // couldn't parse
    }
}
