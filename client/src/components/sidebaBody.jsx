import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "./sidebar";
import { Link } from "react-router-dom";
import dashboardIcon from "../assets/dashboard.webp";
import tableIcon from "../assets/table.webp";
import summaryIcon from "../assets/summary.webp";

import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
} from "@tabler/icons-react";
import { motion } from "framer-motion";

const cn = (...classes) => classes.filter(Boolean).join(" ");

export function SidebarContent() {
  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        // <IconBrandTabler className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
        <img src={dashboardIcon} alt="Dashboard" className="w-5 h-5" />
      ),
    },
    {
      label: "Summary",
      href: "#",
      icon: <img src={summaryIcon} alt="Dashboard" className="w-5 h-5" />,
    },
    {
      label: "All Transactions",
      href: "#",
      icon: <img src={tableIcon} alt="Dashboard" className="w-5 h-5" />,
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
      ),
    },
    {
      label: "End Session",
      href: "#",
      icon: (
        <IconArrowLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-200" />
      ),
    },
  ];
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-neutral-800 w-full flex-1 max-w-7xl mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden h-screen"
      )}
    >
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink key={idx} link={link} />
              ))}
            </div>
          </div>
        </SidebarBody>
      </Sidebar>
      <Dashboard />
    </div>
  );
}

export const Logo = () => (
  <Link
    to="#"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="font-medium text-black dark:text-white whitespace-pre"
    >
      Analyze
    </motion.span>
  </Link>
);

export const LogoIcon = () => (
  <Link
    to="#"
    className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
  >
    <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
  </Link>
);

const Dashboard = () => {
  return (
    <div className="flex flex-1">
      <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-100 flex flex-col gap-2 flex-1 w-full h-full">
        <div className="min-h-screen p-4 bg-gray-200 flex flex-col gap-4">
          {/* Top bar */}
          <div className="bg-lime-500 h-16 w-full rounded-lg"></div>

          <div className="flex flex-col md:flex-row gap-4">
            {/* Left Section */}
            <div className="flex flex-col gap-4 md:w-1/2">
              <div className="bg-lime-500 h-24 w-full rounded-lg"></div>
              <div className="bg-lime-500 flex-1 rounded-lg"></div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col gap-4 md:w-1/2">
              <div className="bg-lime-500 h-24 w-full rounded-lg"></div>
              <div className="bg-lime-500 flex-1 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SidebarContent;
