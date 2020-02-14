import { TreeItemToken, TreeItemNode, TreeItem, BaseSyntaxTree } from "./base-tree";
import { BaseParserToken } from "./base-parser";
import { BaseTreeProcessor } from "./base-tree-processor";


export abstract class BaseTreeModificator<T> extends BaseTreeProcessor<T> {

    protected tokens: BaseParserToken<T>[] = [];
    protected tokenMap: { [pos: string]: BaseParserToken<T> } = {};

    protected initTree(tree: BaseSyntaxTree<T>) {
        let [tokens, tokenMap] = this.collectTree(tree);
        this.tokens = tokens;
        this.tokenMap = tokenMap;
    }

    protected collectTree(tree: BaseSyntaxTree<T>): [BaseParserToken<T>[], { [pos: string]: BaseParserToken<T> }] {
        let tokens: BaseParserToken<T>[] = [];
        let tokenMap: { [pos: string]: BaseParserToken<T> } = {};
        tree.items.forEach(item => {
            this.collectItems(item, tokens, tokenMap);
        });
        return [tokens, tokenMap];
    }

    protected collectItems(treeItem: TreeItem<T>, tokens: BaseParserToken<T>[], tokenMap: { [pos: string]: BaseParserToken<T> }) {
        treeItem.content.forEach(contentItem => {
            if (contentItem instanceof TreeItemToken && contentItem.token) {
                let posId = '' + contentItem.token.pos[2];
                tokens.push(contentItem.token);
                tokenMap[posId] = contentItem.token;
            }
            if (contentItem instanceof TreeItemNode && contentItem.node) {
                this.collectItems(contentItem.node, tokens, tokenMap);
            }
        });
    }

    moveLinesFrom(line: number, offset: number) {
        this.tokens.forEach(t => {
            if (t.pos[0] >= line) { t.pos[0] += offset; }
            if (t.pos[0] < 0) { throw new Error('negative line'); }
        });
    }

    moveLinesFromToken(start: BaseParserToken<T>, offset: number) {
        let idx = this.tokens.indexOf(start);
        if (idx) {
            this.tokens.slice(idx).forEach(t => {
                t.pos[0] += offset;
            });
        }
    }

    addLineToItem(item: TreeItem<T>, line: number) {
        this.walkChildTokens([item], token => {
            token.pos[0] += line;
            if (token.pos[0] < 0) { throw new Error('negative line'); }
        });
    }

    relineItem(item: TreeItem<T> | TreeItemNode<T> | TreeItemToken<T>, newStart: number) {
        if (item instanceof TreeItemNode && item.node) {
            item = item.node;
        }
        if (item instanceof TreeItem && item) {
            let firstToken = item.getFirstToken();
            let lastToken = item.getLastToken();
            if (!firstToken || !lastToken) { return newStart; }
            let offset = newStart - firstToken.pos[0];
            let [from, to] = [this.tokens.indexOf(firstToken), this.tokens.indexOf(lastToken)];
            for (let i = from; i <= to; i++) {
                this.tokens[i].pos[0] += offset;
                if (this.tokens[i].pos[0] < 0) { throw new Error('negative line'); }
            }
            return lastToken.pos[0];
        }
        if (item instanceof TreeItemToken && item.token) {
            item.token.pos[0] = newStart;
            return item.token.pos[0];
        }
        return newStart;
    }


}