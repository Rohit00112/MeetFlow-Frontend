"use client";

import Navbar from "@/components/Navbar";
import Image, { StaticImageData } from "next/image";
import Image1 from "@/public/slider1.png";
import Image2 from "@/public/slider2.png";
import Image3 from "@/public/slider3.png";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React from "react";

export default function Home() {
  interface ImageProps {
    src: StaticImageData;
    alt: string;
    title: string;
    description: string;
  }

  const images: ImageProps[] = [
    {
      src: Image1,
      alt: "MeetFlow Security",
      title: "Your meeting is safe",
      description:
        "No one can join a meeting unless invited or admitted by the host",
    },
    {
      src: Image3,
      alt: "MeetFlow Security",
      title: "Plan ahead",
      description:
        "Click New Meeting to schedule meetings in Google Calendarand send invites to participants",
    },
    {
      src: Image2,
      alt: "MeetFlow Security",
      title: "Get a link you can share",
      description:
        "Click New Meeting to get a link you can send to people that you want to meet with",
    },
  ];

  const [index, setIndex] = React.useState(0);

  // Render Image with previous and next buttons to slide through images
  const ImageSlider = () => {
    const handleNext = () => {
      setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
      setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
          >
            <Icon icon="akar-icons:chevron-left" className="w-6 h-6" />
          </button>
          <div className="relative w-56 h-56">
            <Image
              src={images[index].src}
              alt={images[index].alt}
              fill
              className="rounded-full object-cover transition-opacity duration-500"
              priority
            />
          </div>
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100"
          >
            <Icon icon="akar-icons:chevron-right" className="w-6 h-6" />
          </button>
        </div>
        <div className="flex gap-2 mt-4">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === index ? "bg-blue-600 w-4" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <main className="px-4 md:px-6 mt-20 md:mt-52 ml-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left Column */}
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl leading-tight">
              Video calls and meetings for everyone
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Connect, collaborate and celebrate from anywhere with Google Meet
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors">
                <Icon icon="ri:video-add-line" className="w-5 h-5" />
                New Meeting
              </button>
              <div className="flex items-center gap-2 border-2 border-gray-300 rounded-lg px-3 py-2 focus-within:border-blue-600">
                <Icon
                  icon="material-symbols:keyboard-outline"
                  className="w-5 h-5 text-gray-500"
                />
                <input
                  type="text"
                  placeholder="Enter a code or link"
                  className="flex-1 outline-none text-gray-700"
                  aria-label="Meeting code"
                />
              </div>
              <div className="mt-3">
                <Link href="/join" legacyBehavior>
                  <a className="text-blue-600 hover:underline">Join</a>
                </Link>
              </div>
            </div>
            <hr className="border-t border-gray-600" />
            <p className="text-xs">
              <span className="underline">
                <Link href="/learn-more" legacyBehavior>
                  <a className="text-blue-600 hover:underline">Learn more</a>
                </Link>
              </span>{" "}
              about Google Meet
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            <ImageSlider />
            <div className="max-w-md space-y-3">
              <h2 className="text-2xl font-semibold text-gray-800">
                {images[index].title}
              </h2>
              <p className="text-gray-600">{images[index].description}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
