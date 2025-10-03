export function randomPeriods(lenght: number){
    let outStr = '';
    for(let i = 0; i < lenght; i++){
        outStr += Math.random() > 0.5 ? '.' : ' ';
    }
    return outStr;
}