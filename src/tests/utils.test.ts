import { assert } from 'node:console';
import { arrayEquals, markdownToTerminal } from '../markdown/markdowner.ts';



const a1 = ['a', 'b', 'c'];
const a2 = ['b', 'c', 'a'];

const a3 = ['b', 'a', 'd'];
const a4 = ['b', 'a', 'c', 'c'];


assert(arrayEquals(a1, a2) === true, 'arrays equal 1');
assert(arrayEquals(a1, a3) === false, 'arrays not equal 2');
assert(arrayEquals(a1, a4) === false, 'arrays not equal 3');