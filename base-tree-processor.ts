import { TreeItemToken, TreeItemNode, TreeItem, BaseSyntaxTree } from "./base-tree";
import { BaseParserToken } from "./base-parser";


export abstract class BaseTreeProcessor<T> {

    protected stringifyToken(type: T, value: string): string {
        return value;
    }
    
    foreachTokensByName(item: TreeItem<T>, name: string, callback: (token: BaseParserToken<T>) => void) {
        item.content.forEach(ci => {
            if (ci instanceof TreeItemToken && ci.token && ci.name === name) { callback(ci.token); }
        });
    }

    foreachTokenItemsByName(item: TreeItem<T>, name: string, callback: (tokenItem: TreeItemToken<T>) => void) {
        item.content.forEach(ci => {
            if (ci instanceof TreeItemToken && ci.token && ci.name === name) { callback(ci); }
        });
    }

    foreachNodeChildsByName(item: TreeItem<T>, name: string, callback: (tokenItem: TreeItemNode<T>) => void) {
        item.content.forEach(ci => {
            if (ci instanceof TreeItemNode && ci.item && ci.name === name) { callback(ci); }
        });
    }

    foreachTokenItemPairsByName(item: TreeItem<T>, fromTo: [string, string], callback: (from: TreeItemToken<T>, to: TreeItemToken<T>) => void) {
        let [fromName, toName] = fromTo;
        let from: TreeItemToken<T> | null = null;
        item.content.forEach(ci => {
            if (ci instanceof TreeItemToken && ci.token && ci.name === fromName) {
                from = ci;
            }
            if (ci instanceof TreeItemToken && ci.token && ci.name === toName && from !== null) {
                callback(from, ci);
                from = null;
            }
        });
    }

}




