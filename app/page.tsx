"use client";

import Navbar from "@/components/Navbar";
import Image from "next/image";
import Image1 from "@/public/slider1.png";

export default function Home() {
  return (
    <>
      <Navbar />
      <div className="flex items-center justify-around mt-40 ">
        <div className="flex flex-col">
          <h1 className="text-5xl font-normal w-2/3">
            Video calls and meetings for everyone
          </h1>
          <p className="text-2xl font-light mt-4 w-2/3">
            Connect, collaborate and celebrate from anywhere with Google Meet
          </p>
        </div>
        <div className="gap-8">
          <Image src={Image1} alt="MeetFlow" height={220} width={220} />
          <div className="flex flex-col ml-20">
            <h2 className="text-2xl font-medium">Your meeting is safe</h2>
            <p className="mt-4">
              No one can join a meeting unless invited or admitted by the host
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
