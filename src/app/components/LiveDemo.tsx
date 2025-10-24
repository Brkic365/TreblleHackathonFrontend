"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Request from '@/app/components/Request';
import styles from "@/styles/components/LiveDemo.module.scss";

interface RequestData {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  response: number;
  name: string;
  loadTime: number;
  location: string;
  time: string;
}

// A pool of mock data to cycle through
const MOCK_DATA_POOL: RequestData[] = [
  { id: '1', method: 'GET', response: 200, name: 'api/users', loadTime: 64.36, location: 'Berlin, Germany', time: 'now' },
  { id: '2', method: 'POST', response: 201, name: 'auth/login', loadTime: 112.05, location: 'Amsterdam, Netherlands', time: 'now' },
  { id: '3', method: 'PUT', response: 401, name: 'auth/logout', loadTime: 85.15, location: 'London, UK', time: 'now' },
  { id: '4', method: 'GET', response: 404, name: 'api/products/12345', loadTime: 22.80, location: 'Paris, France', time: 'now' },
  { id: '5', method: 'DELETE', response: 204, name: 'api/posts/42', loadTime: 98.40, location: 'New York, USA', time: 'now' },
  { id: '6', method: 'GET', response: 200, name: 'api/analytics', loadTime: 156.20, location: 'Tokyo, Japan', time: 'now' },
  { id: '7', method: 'POST', response: 422, name: 'api/orders', loadTime: 78.90, location: 'Sydney, Australia', time: 'now' },
  { id: '8', method: 'PUT', response: 200, name: 'api/profile', loadTime: 45.30, location: 'Toronto, Canada', time: 'now' },
];

function LiveDemo() {
  const [liveRequests, setLiveRequests] = useState<RequestData[]>(MOCK_DATA_POOL.slice(0, 2));
  const [viewMode] = useState<'list' | 'table'>('list');

  useEffect(() => {
    const interval = setInterval(() => {
      const newItem = MOCK_DATA_POOL[Math.floor(Math.random() * MOCK_DATA_POOL.length)];
      
      setLiveRequests(prev => {
        // Add a new item to the top and ensure the list doesn't grow too long
        const updatedList = [{ ...newItem, id: Date.now().toString() }, ...prev];
        return updatedList.slice(0, 5); // Keep a max of 5 items
      });
    }, 2500); // Add a new request every 2.5 seconds

    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <div className={styles.liveDemo}>
      <div className={styles.container}>
        <div className={styles.demoHeader}>
          <div className={styles.liveBadge}>
            <div className={styles.pulseDot}></div>
            <span>LIVE DEMO</span>
          </div>
          <h2 className={styles.demoTitle}>See Your Traffic in Real-Time</h2>
          <p className={styles.demoDescription}>
            Watch as API requests stream in from around the world. This is what you'll see when you start monitoring your APIs.
          </p>
        </div>

        <div className={styles.demoContent}>
          <div className={styles.requestsContainer}>
            <AnimatePresence mode="popLayout">
              {liveRequests.map((request, index) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: -20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.95 }}
                  transition={{ 
                    duration: 0.4,
                    ease: "easeOut",
                    delay: index * 0.1
                  }}
                  layout
                >
                  <Request
                    request={{
                      id: request.id,
                      method: request.method,
                      path: request.name,
                      statusCode: request.response,
                      responseTime: request.loadTime,
                      timestamp: request.time
                    }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveDemo;
