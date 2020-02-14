import { TreeItemToken } from "./base-tree";
import { BaseParserToken } from "./base-parser";


export class ParserInfo {

    public static info(item: any) {
        item = this.modifyForLog(item, 0, []);
        console.info("\n\nParserInfo\n\n");
        console.info(JSON.stringify(item, null, 2));
    }

    private static modifyForLog(item: any, depth: number, recurstion: any[]): any {
        if (item === null || typeof (item) === 'undefined') {
            return item;
        }
        if (typeof (item) === 'object' && recurstion.includes(item)) { return '(circular)'; }
        recurstion.push(item);
        if (depth > 5) { return '(...)'; }
        // basic
        if (Array.isArray(item)) {
            let newItem = [];
            for (let i = 0; i < item.length; i++) {
                newItem.push(this.modifyForLog(item[i], depth + 1, recurstion));
            }
            return newItem;
        } else if (typeof (item) === 'object') {
            let newItem: any = { 'constructor': item.constructor.name }
            Object.keys(item).forEach(key => {
                newItem[key] = this.modifyForLog(item[key], depth + 1, recurstion);
            });

            // customs
            if (item instanceof TreeItemToken && item.token) {
                newItem.token = this.stringifyToken(item.token);
            }

            return newItem;
        } else {
            return item;
        }
    }


    private static stringifyToken(token: BaseParserToken<any>) {
        return '(' + token.pos[2] + ')[' + token.pos[0] + ',' + token.pos[1] + '] ' + token.type + ':' + JSON.stringify(token.value);
    }

}




export class ParserFormat {

    static formatLines(lines: string[]): [string, string][] {
        let len = ('' + lines.length).length;
        return lines.map((line, idx) => {
            let numString = '' + (idx + 1);
            while (numString.length < len) { numString = ' ' + numString; }
            return [numString, line];
        });
    }



}