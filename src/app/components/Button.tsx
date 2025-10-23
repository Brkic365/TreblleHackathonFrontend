import React from 'react'
import styles from "@/styles/components/Button.module.scss"

function Button({ text, style }: { text: string, style: string }) {
  return (
    <button className={`${styles.button} ${style === "red" ? styles.red : styles.transparent}`}>
        <span className={styles.buttonText}>
          {text}
        </span>
    </button>
  )
}

export default Button