"use client";

import Navbar from "@/components/Navbar";
import Image, { StaticImageData } from "next/image";
import Image1 from "@/public/slider1.png";
import Image2 from "@/public/slider2.png";
import Image3 from "@/public/slider3.png";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import React, { useState } from "react";

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
    alt: "MeetFlow Planning",
    title: "Plan ahead",
    description:
      "Click New Meeting to schedule meetings in Google Calendar and send invites to participants",
  },
  {
    src: Image2,
    alt: "MeetFlow Sharing",
    title: "Get a link you can share",
    description:
      "Click New Meeting to get a link you can send to people that you want to meet with",
  },
];

// ImageSlider Component
const ImageSlider = ({ images }: { images: ImageProps[] }) => {
  const [index, setIndex] = React.useState(0);

  const handleNext = () =>
    setIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  const handlePrev = () =>
    setIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={handlePrev}
          aria-label="Previous Image"
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
          aria-label="Next Image"
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
            aria-label={`Select Image ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i === index ? "bg-blue-600 w-4" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-transparent flex items-center mt-72 ml-16"
      onClick={onClose}
    >
      <div
        className="bg-white p-2 rounded-lg shadow-lg space-y-2"
        onClick={(e) => e.stopPropagation()} // Prevent modal close on content click
      >
        <button className="w-full flex items-center gap-6 hover:bg-gray-100 px-4 py-2 rounded">
          <Icon icon="material-symbols:link-rounded" width="24" height="24" />
          Create a meeting for later
        </button>
        <button
          className="w-full flex items-center gap-6 hover:bg-gray-100 px-4 py-2 rounded"
          onClick={() => {
            window.location.href = "/meeting";
          }}
        >
          <Icon icon="ic:baseline-plus" width="24" height="24" />
          Start an instant meeting
        </button>
        <button className="w-full flex items-center gap-6 hover:bg-gray-100 px-4 py-2 rounded">
          <Icon icon="lucide:calendar" width="24" height="24" />
          Schedule in Google Calendar
        </button>
      </div>
    </div>
  );
};

export default function Home() {
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [index] = React.useState(0);
  const [inputValue, setInputValue] = useState("");

  return (
    <>
      <Navbar />
      <main className="px-4 md:px-6 mt-20 md:mt-52 ml-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl leading-tight">
              Video calls and meetings for everyone
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              Connect, collaborate, and celebrate from anywhere with Google Meet
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                <Icon icon="ri:video-add-line" className="w-5 h-5" />
                New Meeting
              </button>
              <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
              />
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
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div className="mt-3">
                <Link href="/join" legacyBehavior>
                  <a
                    className={`text-blue-600 ${
                      !inputValue
                        ? "pointer-events-none text-gray-600 opacity-50"
                        : "hover:underline"
                    }`}
                  >
                    Join
                  </a>
                </Link>
              </div>
            </div>
            <hr className="border-t border-gray-600" />
            <p className="text-xs">
              <Link href="/learn-more" legacyBehavior>
                <a className="text-blue-600 hover:underline">Learn more</a>
              </Link>{" "}
              about Google Meet
            </p>
          </div>

          <div className="flex flex-col items-center text-center space-y-6">
            <ImageSlider images={images} />
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
