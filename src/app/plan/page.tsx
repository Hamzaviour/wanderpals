import type { Metadata } from "next";
import { TripApp } from "@/components/TripApp";

export const metadata: Metadata = {
  title: "Plan a trip · Wanderpals",
};

export default function PlanPage() {
  return <TripApp />;
}
