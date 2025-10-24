"use client";

import React from 'react';
import styles from "@/styles/components/Footer.module.scss";

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.brand}>
            <h3 className={styles.brandName}>RUNTIME</h3>
            <p className={styles.brandDescription}>
              Monitor, analyze, and optimize your APIs with real-time insights.
            </p>
          </div>
          
          <div className={styles.links}>
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Product</h4>
              <a href="#" className={styles.link}>Features</a>
              <a href="#" className={styles.link}>Pricing</a>
              <a href="#" className={styles.link}>Documentation</a>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Company</h4>
              <a href="#" className={styles.link}>About</a>
              <a href="#" className={styles.link}>Contact</a>
              <a href="#" className={styles.link}>Support</a>
            </div>
            
            <div className={styles.linkGroup}>
              <h4 className={styles.linkTitle}>Legal</h4>
              <a href="#" className={styles.link}>Privacy Policy</a>
              <a href="#" className={styles.link}>Terms of Service</a>
            </div>
          </div>
        </div>
        
        <div className={styles.bottom}>
          <p className={styles.copyright}>
            © 2024 RunTime. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;