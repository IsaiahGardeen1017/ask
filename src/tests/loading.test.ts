import { assert } from 'node:console';
import { arrayEquals, markdownToTerminal } from '../markdown/markdowner.ts';
import { IOManager, loadUntil } from '../ioManager.ts';
import { delay } from '../utils.ts';



async function fun(){
    loadUntil(delay(10000));
}

fun();