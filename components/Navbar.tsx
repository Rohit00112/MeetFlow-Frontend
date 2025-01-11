import Image from "next/image";
import { Icon } from "@iconify/react";
import Logo from "@/public/logo.png";

// Separate time formatting logic
const getFormattedDateTime = (): string => {
  const now = new Date();
  const time = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const day = now.toLocaleDateString("en-US", { day: "numeric" });
  const month = now.toLocaleDateString("en-US", { month: "short" });

  return `${time} • ${weekday} ${day} ${month}`;
};

// Define icon props type
interface IconProps {
  icon: string;
  size?: number;
}

// Reusable Icon component
const NavIcon = ({ icon, size = 24 }: IconProps) => (
  <Icon icon={icon} width={size} height={size} />
);

const Navbar = () => {
  return (
    <nav className="flex justify-between p-4 text-[#5F6367]">
      <div className="flex items-center">
        <Image
          src={Logo}
          alt="MeetFlow Logo"
          width={120}
          height={120}
          priority
        />
        <span className="ml-1 mb-1 text-2xl">Meet</span>
      </div>

      <div className="flex gap-14">
        <div className="flex gap-6 items-center">
          <time>{getFormattedDateTime()}</time>
          <NavIcon icon="akar-icons:question" />
          <NavIcon icon="octicon:report-24" />
          <NavIcon icon="mdi:settings" />
        </div>

        <div className="flex gap-3 items-center">
          <NavIcon icon="mage:dots-menu" />
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
            <span className="text-xl font-bold">A</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
