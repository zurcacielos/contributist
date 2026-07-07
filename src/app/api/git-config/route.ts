import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET() {
  let name = "";
  let email = "";
  try {
    const { stdout: nameOut } = await execAsync("git config user.name");
    name = nameOut.trim();
  } catch (e) {
    // ignore
  }

  try {
    const { stdout: emailOut } = await execAsync("git config user.email");
    email = emailOut.trim();
  } catch (e) {
    // ignore
  }

  return NextResponse.json({ name, email });
}
