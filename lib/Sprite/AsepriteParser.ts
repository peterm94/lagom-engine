// @ts-ignore
import Aseprite from "ase-parser";
import { Buffer } from 'buffer';

export async function parseAseprite(file: string) {
  const res = await fetch(file);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const aseprite = new Aseprite(buffer, "lady")
  aseprite.parse();
  console.log(aseprite);
}