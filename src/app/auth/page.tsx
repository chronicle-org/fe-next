import Image from "next/image";
import SignIn from "./SignIn";
import { cn } from "@/lib/utils";

export default function Auth() {

  return (
    <div className={cn("flex max-md:flex-wrap w-full flex-1 max-md:relative")}>
      <div className="w-full flex justify-center items-center bg-none bg-muted max-md:hidden">
        <div className="relative w-[30vw] h-[30vw] rounded-lg overflow-hidden">
          <Image src={"/auth-side-image.png"} alt="auth-side-image" fill />
        </div>
      </div>

      <SignIn />
    </div>
  );
}
