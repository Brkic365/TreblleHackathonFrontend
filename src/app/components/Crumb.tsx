import React from 'react'
import styles from "@/styles/components/Crumb.module.scss"

function Crumb({ text, isNew }: { text: string, isNew: boolean }) {
  return (
    <section className={styles.crumb}>
      <span className={styles.crumbNew}>{isNew ? "New" : ""}</span>
      <span className={styles.crumbText}>{text}</span>
    </section>
  )
}

export default Crumb