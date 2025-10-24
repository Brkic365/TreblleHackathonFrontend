import React from 'react'
import styles from "@/styles/components/Button.module.scss"

function Button({ text, style, size, action }: { text: string, style: string, size: string, action: () => void }) {
  return (
    <button onClick={action} className={`${styles.button} ${style === "red" ? styles.red : styles.transparent} ${size === "m" ? styles.sizeM : size === "l" ? styles.sizeL : ""}`}>
        <span className={styles.buttonText}>
          {text}
        </span>
    </button>
  )
}

export default Button