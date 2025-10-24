"use client";

import React from 'react';
import styles from "@/styles/components/HowItWorks.module.scss";

function HowItWorks() {
  const steps = [
    {
      title: "Bring Your API",
      description: "Enter your existing API endpoint. No code changes required yet.",
      icon: "🔗"
    },
    {
      title: "Get Your Gateway",
      description: "We instantly generate a unique, secure proxy URL for you.",
      icon: "🛡️"
    },
    {
      title: "See Everything", 
      description: "Replace your base URL and watch requests stream in real-time.",
      icon: "👁️"
    }
  ];

  return (
    <div className={styles.howItWorks}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>How It Works</h2>
          <p className={styles.subtitle}>
            Get started in minutes with our simple proxy method. No complex SDKs or integrations required.
          </p>
        </div>

        <div className={styles.steps}>
          {steps.map((step, index) => (
            <div key={step.number} className={styles.step}>
              <div className={styles.stepIcon}>{step.icon}</div>
              <div className={styles.stepContent}>
                <h3 className={styles.stepTitle}>{step.title}</h3>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className={styles.stepConnector}>
                  <div className={styles.connectorLine}></div>
                  <div className={styles.connectorArrow}>→</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HowItWorks;
