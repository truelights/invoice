import React from "react";
import Link from "next/link";
function page() {
  return (
    <div>
      <Link href={"/dashboard"}>dashboard</Link>
      <Link href={"/login"}>login</Link>
      <Link href={"/register"}>register</Link>
    </div>
  );
}

export default page;
