"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import styles from "@/styles/pages/Home.module.scss";
import Crumb from "./components/Crumb";
import Button from "./components/Button";
import Navbar from "./components/Navbar";
import HowItWorks from "./components/HowItWorks";
import LiveDemo from "./components/LiveDemo";
import Features from "./components/Features";
import Footer from "./components/Footer";

import localFont from 'next/font/local';  

const titleFont = localFont({
  src: './fonts/Michroma-Regular.ttf',
  display: 'swap',
});

export default function Home() {
  const router = useRouter();

  return (
    <main className={styles.home}>
      <section className={styles.hero}>
        <Crumb text="Live Performance Boosts" isNew={true} />
        <h1 className={titleFont.className}>Smarter API Performance.<br />Real-Time Insights.</h1>
        <p>RunTime AI monitors, analyzes, and optimizes your APIs so you can focus on building - not debugging.</p>
        <Button text="Start Monitoring Now" style="transparent" size="l" action={() => router.push("/signup")}/>
      </section>

      <HowItWorks />
      
      <LiveDemo />
      
      <Features />
      
      <section className={styles.finalCta}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>Ready to get real insights?</h2>
          <p className={styles.ctaDescription}>
            Join thousands of developers who trust RunTime to monitor their APIs.
          </p>
          <Button text="Get Started for Free" style="red" size="l" action={() => router.push("/signup")}/>
        </div>
      </section>

      <Footer />
    </main>
  );
}
