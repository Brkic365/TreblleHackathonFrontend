"use client";

import React from 'react';
import styles from "@/styles/components/Features.module.scss";

function Features() {
  const features = [
    {
      icon: "⚡",
      title: "Instant Error Tracking",
      description: "Catch 4xx and 5xx errors the moment they happen so you can debug faster."
    },
    {
      icon: "🌍",
      title: "Global Latency Insights", 
      description: "See exactly how long requests take from different regions around the world."
    },
    {
      icon: "🚀",
      title: "Effortless Setup",
      description: "Get started in under 60 seconds with our simple proxy method. No complex SDKs to install."
    }
  ];

  return (
    <div className={styles.features}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Why Choose RunTime?</h2>
          <p className={styles.subtitle}>
            Powerful monitoring capabilities designed for modern development teams.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          {features.map((feature, index) => (
            <div key={index} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Features;
