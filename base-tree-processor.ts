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

    foreachItemsByName(item: TreeItem<T>, name: string, callback: (tokenItem: TreeItemNode<T>) => void) {
        item.content.forEach(ci => {
            if (ci instanceof TreeItemNode && ci.node && ci.name === name) { callback(ci); }
        });
    }

    foreachChildsByNameCastet<C extends TreeItem<T>>(item: TreeItem<T>, name: string, callback: (tokenItem: C) => void) {
        item.content.forEach(ci => {
            if (ci instanceof TreeItemNode && ci.node && ci.name === name) { callback(<C>ci.node); }
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

    getItemsByName(item: TreeItem<T>, name: string): TreeItem<T>[] {
        let result: TreeItem<T>[] = [];
        this.foreachItemsByName(item, name, inst => {
            if (inst.node) { result.push(inst.node); }
        });
        return result;
    }

    getNodesByName(item: TreeItem<T>, name: string): TreeItemNode<T>[] {
        let result: TreeItemNode<T>[] = [];
        this.foreachItemsByName(item, name, inst => {
            if (inst.node) { result.push(inst); }
        });
        return result;
    }

    findNodeByName(item: TreeItem<T>, name: string, fromIndex: (TreeItemToken<T> | TreeItemNode<T> | number) = -1): TreeItemNode<T> | null {
        if (fromIndex instanceof TreeItemToken) { fromIndex = item.content.indexOf(fromIndex); }
        if (fromIndex instanceof TreeItemNode) { fromIndex = item.content.indexOf(fromIndex); }
        let result: TreeItemNode<T> | null = null;
        item.content.some((childItem, idx) => {
            if (idx > fromIndex && childItem instanceof TreeItemNode && childItem.name === name) { result = childItem; return true; }
            return false;
        });
        return result;
    }


    findTokenByName(item: TreeItem<T>, name: string, fromIndex: (TreeItemToken<T> | TreeItemNode<T> | number) = -1): TreeItemToken<T> | null {
        if (fromIndex instanceof TreeItemToken) { fromIndex = item.content.indexOf(fromIndex); }
        if (fromIndex instanceof TreeItemNode) { fromIndex = item.content.indexOf(fromIndex); }
        let result: TreeItemToken<T> | null = null;
        item.content.some((childItem, idx) => {
            if (idx > fromIndex && childItem instanceof TreeItemToken && childItem.name === name) { result = childItem; return true; }
            return false;
        });
        return result;
    }



    nextChild(item: TreeItem<T>, fromIndex: (TreeItemToken<T> | TreeItemNode<T> | number)): TreeItemToken<T> | TreeItemNode<T> | null {
        if (fromIndex instanceof TreeItemToken) { fromIndex = item.content.indexOf(fromIndex); }
        if (fromIndex instanceof TreeItemNode) { fromIndex = item.content.indexOf(fromIndex); }
        if (item.content.length > fromIndex + 1) { return item.content[fromIndex + 1]; }
        return null;
    }

    walkChildItems(source: TreeItem<T>[], callback: (item: TreeItem<T>) => void): void {
        source.forEach(item => {
            callback(item);
            let childs: TreeItem<T>[] = [];
            item.content.forEach(child => {
                if (child instanceof TreeItemNode && child.node) {
                    childs.push(child.node);
                }
            });
            this.walkChildItems(childs, callback);
        });
    }

    walkChildTokens(source: TreeItem<T>[], callback: (item: BaseParserToken<T>) => void): void {
        source.forEach(item => {
            let childs: TreeItem<T>[] = [];
            item.content.forEach(child => {
                if (child instanceof TreeItemNode && child.node) {
                    childs.push(child.node);
                }
                if (child instanceof TreeItemToken && child.token) {
                    callback(child.token);
                }
            });
            this.walkChildTokens(childs, callback);
        });
    }

    getLinesCount(item: TreeItem<T>): number {
        let first = item.getFirstToken();
        let last = item.getLastToken();
        if (first && last) {
            return last.pos[0] - first.pos[0] + 1;
        } else {
            return -1;
        }
    }

    getFirstLineOfNode(node: TreeItemNode<T> | TreeItemToken<T>) {
        if (node instanceof TreeItemNode) {
            if (!node || !node.node) { return -1; }
            let fistToken = node.node.getFirstToken();
            if (!fistToken) { return -1; }
            return fistToken.pos[0];
        }
        if (node instanceof TreeItemToken) {
            if (!node || !node.token) { return -1; }
            return node.token.pos[0];
        }
        return 1;
    }

    getLastLineOfNode(node: TreeItemNode<T> | TreeItemToken<T>) {
        if (node instanceof TreeItemNode) {
            if (!node || !node.node) { return -1; }
            let lastToken = node.node.getLastToken();
            if (!lastToken) { return -1; }
            return lastToken.pos[0];
        }
        if (node instanceof TreeItemToken) {
            if (!node || !node.token) { return -1; }
            return node.token.pos[0];
        }
        return 1;
    }

    getFirstLineOfItem(item: TreeItem<T>) {
        if (!item) { return -1; }
        let fistToken = item.getFirstToken();
        if (!fistToken) { return -1; }
        return fistToken.pos[0];
    }


    protected modifyTokenValue(token: BaseParserToken<T> | TreeItemToken<T>, mod: (value: string) => string) {
        if (token instanceof TreeItemToken) {
            if (token.token) { token.token.value = mod(token.token.value); }
        } else {
            token.value = mod(token.value);
        }
    }


}




