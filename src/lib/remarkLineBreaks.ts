/**
 * @import {Root} from 'mdast'
 */

import { findAndReplace } from 'mdast-util-find-and-replace'
import { u } from 'unist-builder'

export default function remarkLineBreaks() {
    return function (tree: any) {
        findAndReplace(tree, [
            /\n/g,
            function ($0) {
                console.log("aah")
                console.log($0);
                return u("break");
            }
        ])
    }
}