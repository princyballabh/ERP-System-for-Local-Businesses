"use client";

import { FaExternalLinkAlt, FaCalculator } from "react-icons/fa";

const calculatorUrl = "https://gst-calculator.up.railway.app/";

export default function GstCalculatorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-white to-mint p-6 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-3xl bg-white/90 shadow-xl border border-white/60 p-5 md:p-6 backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 text-sm font-semibold text-navy">
                <FaCalculator />
                GST Calculator
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-navy">
                GST Calculator
              </h1>
              <p className="max-w-2xl text-gray-600">
                Calculate GST quickly inside this page, or open the live version
                in a new tab if needed.
              </p>
            </div>

            <a
              href={calculatorUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-darkblue px-5 py-3 font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
            >
              Open Live Calculator
              <FaExternalLinkAlt />
            </a>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white shadow-xl">
          <div className="border-b border-gray-200 px-5 py-1 text-sm font-medium text-gray-500">
            Embedded view
          </div>
          <div className="overflow-hidden bg-white">
            <iframe
              src={calculatorUrl}
              title="GST Calculator"
              className="block h-[74vh] w-full scale-[0.76] origin-top-left md:h-[110vh] md:w-[131.5%] md:scale-[0.86]"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
