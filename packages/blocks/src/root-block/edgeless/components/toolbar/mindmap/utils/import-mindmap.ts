import type { Bound } from '@blocksuite/global/utils';

import { openFileOrFiles } from '@blocksuite/affine-shared/utils';
import { BlockSuiteError, ErrorCode } from '@blocksuite/global/exceptions';
import converter from 'xml-js';

type MindMapNode = {
  children: MindMapNode[];
  text: string;
  xywh?: string;
  title?: string;
  layoutType?: 'left' | 'right';
};

export async function importMindmap(bound: Bound): Promise<MindMapNode> {
  const file = await openFileOrFiles({
    acceptType: 'MindMap',
  });

  if (!file) {
    throw new BlockSuiteError(ErrorCode.UserAbortError, 'Aborted by user');
  }

  let result;

  if (file.name.endsWith('.mm')) {
    result = await parseMmFile(file);
  } else if (file.name.endsWith('.opml')) {
    result = await parseOPMLFile(file);
  } else {
    throw new BlockSuiteError(ErrorCode.ParsingError, 'Unsupported file type');
  }

  if (result) {
    result.xywh = bound.serialize();
  }

  return result;
}

function readAsText(file: File) {
  return file.text();
}

type RawMmNode = {
  node: RawMmNode[];
  _attributes: {
    POSITION: 'left' | 'right';
    TEXT: string;
  };
};

async function parseMmFile(file: File): Promise<MindMapNode> {
  const content = await readAsText(file);

  try {
    const { map } = JSON.parse(converter.xml2json(content, { compact: true }));
    const traverse = (node: RawMmNode): MindMapNode => {
      return node._attributes.POSITION
        ? {
            layoutType: node._attributes.POSITION,
            text: node._attributes.TEXT ?? 'MINDMAP',
            children: node.node?.map(traverse) ?? [],
          }
        : {
            text: node._attributes.TEXT,
            children: node.node?.map(traverse) ?? [],
          };
    };

    return traverse(map.node);
  } catch (e) {
    console.error(e);
    throw new BlockSuiteError(
      ErrorCode.ParsingError,
      'Failed to parse mm file'
    );
  }
}

type RawOPMLNode = {
  _attributes: {
    text: string;
  };
  outline: RawOPMLNode[];
};

async function parseOPMLFile(file: File): Promise<MindMapNode> {
  const content = await readAsText(file);

  try {
    const { opml } = JSON.parse(converter.xml2json(content, { compact: true }));
    const traverse = (node: RawOPMLNode): MindMapNode => {
      return {
        text: node._attributes?.text ?? 'MINDMAP',
        children: node.outline?.map(traverse) ?? [],
      };
    };

    return traverse(opml.body.outline);
  } catch (e) {
    console.error(e);
    throw new BlockSuiteError(
      ErrorCode.ParsingError,
      'Failed to parse mm file'
    );
  }
}