import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";
import { default as html2text } from "npm:html2text@6.0.0";

const args = parse(Deno.args, {
  boolean: [
    // instructions for this script
    "help",
  ],
  string: [
    // html filename to process
    "file",
    "f",

    // remote url to process
    "url",
    "r",

    // output filename
    "output",
    "o",
  ],
});

const commandName = `html2text`;

const usageMessage = `
Usage: ${commandName} [OPTIONS]
Options:
  --help              Show this help message

  -f, --file  NAME    NAME of input html
  -o, --output NAME   Write output to NAME
  -u, --url URL       URL location to render

  Examples:
  ${commandName} -u http://www.aaronsw.com/2002/html2text/
  ${commandName} -f sample.html -o sample.txt
  cat sample.html | ${commandName}
`;

// parse args
const help = args.help;
const htmlFilename = args.file || args.f;
const htmlUrl = args.url || args.u;
const outputFilename = args.output || args.o;
const readStdin = !htmlFilename && !htmlUrl && args._.length == 0;

if (help) {
  console.log(usageMessage);
  Deno.exit();
}

let htmlStr = "";

if (readStdin) {
  const decoder = new TextDecoder();
  for await (const chunk of Deno.stdin.readable) {
    const textChunk = decoder.decode(chunk);
    htmlStr += textChunk;
  }
}

// only one source
if (htmlFilename && htmlUrl) {
  console.log(usageMessage);
  Deno.exit();
}

// process
if (htmlFilename) {
  let text = Deno.readTextFileSync(htmlFilename);
  htmlStr = text;
}
if (htmlUrl) {
  const textResponse = await fetch(htmlUrl);
  const textData = await textResponse.text();
  htmlStr = textData;
}

let result = html2text.fromString(htmlStr);

if (outputFilename) {
  try {
    Deno.writeTextFileSync(outputFilename, result);
  } catch (e) {
    console.log(e.message);
  }
} else {
  console.log(result);
}
