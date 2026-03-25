'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import type { Prize } from '@/lib/game-store'

// Load lights only on client to avoid hydration mismatch
const DecorativeLights = dynamic(
  () => import('./decorative-lights').then(mod => mod.DecorativeLights),
  { ssr: false }
)

interface RouletteWheelProps {
  prizes: Prize[]
  isSpinning: boolean
  targetAngle: number
  currentResult: { prize: { label: string; emoji: string }; username: string } | null
  onSpinComplete: (prize: string, emoji: string, username: string, visualIndex: number) => void
  onRotationUpdate?: (rotation: number) => void
  rotationRef?: React.MutableRefObject<number>
}

export function RouletteWheel({ prizes, isSpinning, targetAngle, currentResult, onSpinComplete, onRotationUpdate, rotationRef }: RouletteWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [currentRotation, setCurrentRotation] = useState(0)
  const currentRotationRef = useRef(0)
  const animationRef = useRef<number | null>(null)
  const startTimeRef = useRef<number>(0)
  const startAngleRef = useRef<number>(0)
  // Capture result at spin START — never changes during animation
  const capturedResultRef = useRef<typeof currentResult>(null)

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 20

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Save context and rotate
    ctx.save()
    ctx.translate(centerX, centerY)
    ctx.rotate((currentRotation * Math.PI) / 180)
    ctx.translate(-centerX, -centerY)

    const segmentAngle = (2 * Math.PI) / prizes.length

    prizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2
      const endAngle = startAngle + segmentAngle

      // Draw segment
      ctx.beginPath()
      ctx.moveTo(centerX, centerY)
      ctx.arc(centerX, centerY, radius, startAngle, endAngle)
      ctx.closePath()

      // Segment fill with gradient
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
      gradient.addColorStop(0, '#1a1a2e')
      gradient.addColorStop(0.3, prize.color + '40')
      gradient.addColorStop(1, prize.color)
      ctx.fillStyle = gradient
      ctx.fill()

      // Segment border
      ctx.strokeStyle = '#ffffff30'
      ctx.lineWidth = 2
      ctx.stroke()

      // Draw text
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate(startAngle + segmentAngle / 2)
      ctx.textAlign = 'right'
      ctx.fillStyle = '#ffffff'
      ctx.shadowColor = '#000000'
      ctx.shadowBlur = 8

      // Draw emoji
      ctx.font = '22px sans-serif'
      ctx.shadowBlur = 6
      ctx.fillText(prize.emoji, radius - 15, 6)

      // Draw label with strong shadow for readability
      ctx.font = 'bold 13px Arial, sans-serif'
      ctx.shadowBlur = 12
      ctx.shadowColor = '#000000'
      ctx.fillStyle = '#ffffff'
      // Draw text twice for extra boldness
      const words = prize.label.split(' ')
      if (words.length > 1) {
        ctx.fillText(words[0], radius - 45, -5)
        ctx.fillText(words[0], radius - 45, -5)
        ctx.fillText(words.slice(1).join(' '), radius - 45, 10)
        ctx.fillText(words.slice(1).join(' '), radius - 45, 10)
      } else {
        ctx.fillText(prize.label, radius - 45, 3)
        ctx.fillText(prize.label, radius - 45, 3)
      }

      ctx.restore()
    })

    ctx.restore()

    // Draw center circle
    ctx.beginPath()
    ctx.arc(centerX, centerY, 40, 0, 2 * Math.PI)
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 40)
    centerGradient.addColorStop(0, '#fbbf24')
    centerGradient.addColorStop(0.5, '#f59e0b')
    centerGradient.addColorStop(1, '#d97706')
    ctx.fillStyle = centerGradient
    ctx.fill()
    ctx.strokeStyle = '#fcd34d'
    ctx.lineWidth = 3
    ctx.stroke()

    // Draw center text
    ctx.fillStyle = '#1a1a2e'
    ctx.font = 'bold 12px Geist, sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('GIRA', centerX, centerY)

    // Draw outer ring glow
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI)
    ctx.strokeStyle = '#a855f7'
    ctx.lineWidth = 4
    ctx.shadowColor = '#a855f7'
    ctx.shadowBlur = 20
    ctx.stroke()
    ctx.shadowBlur = 0

  }, [prizes, currentRotation])

  // Handle spinning animation
  useEffect(() => {
    if (isSpinning) {
      // Capture the current result RIGHT NOW before anything changes
      capturedResultRef.current = currentResult
      startTimeRef.current = performance.now()
      startAngleRef.current = ((currentRotationRef.current % 360) + 360) % 360

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTimeRef.current
        const duration = 5000

        if (elapsed < duration) {
          const progress = elapsed / duration
          const easeOut = 1 - Math.pow(1 - progress, 3)
          const newRotation = startAngleRef.current + targetAngle * easeOut
          currentRotationRef.current = newRotation
          setCurrentRotation(newRotation)
          animationRef.current = requestAnimationFrame(animate)
        } else {
          const finalRotation = startAngleRef.current + targetAngle
          currentRotationRef.current = finalRotation
          setCurrentRotation(finalRotation)
          onRotationUpdate?.(finalRotation)
          const r = capturedResultRef.current
          // La rueda: segmento i se dibuja desde (i * segAngle - 90°) hasta ((i+1) * segAngle - 90°)
          // El puntero esta arriba (0° en pantalla = -90° en coordenadas del canvas)
          // ctx.rotate(R) rota la rueda R grados en sentido horario
          // Despues de rotar R, lo que estaba en angulo A ahora esta en angulo A + R
          // El puntero (que apunta a -90° en coords canvas) ahora ve el angulo original: -90 - R
          // Para saber que segmento esta bajo el puntero:
          // Segmento i cubre angulos desde (i * segAngle - 90) hasta ((i+1) * segAngle - 90)
          // El angulo bajo el puntero es: -90 - R (normalizado a [0, 360))
          // Para encontrar i: angulo = i * segAngle - 90, entonces i = (angulo + 90) / segAngle
          const segAngle = 360 / prizes.length
          const normalizedRotation = ((finalRotation % 360) + 360) % 360
          // Angulo original que ahora esta bajo el puntero (en coords de la rueda sin rotar)
          const angleUnderPointer = ((-90 - normalizedRotation) % 360 + 360) % 360
          // Calcular el indice del segmento
          const visualIndex = Math.floor(((angleUnderPointer + 90) % 360) / segAngle) % prizes.length
          
          console.log("[v0] roulette spin complete:", {
            finalRotation,
            normalizedRotation,
            angleUnderPointer,
            segAngle,
            visualIndex,
            expectedPrize: prizes[visualIndex]?.label,
            resultPrize: r?.prize.label
          })
          
          onSpinComplete(r?.prize.label ?? '', r?.prize.emoji ?? '', r?.username ?? '', visualIndex)
        }
      }

      animationRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
        }
      }
    }
  }, [isSpinning, targetAngle, onSpinComplete])

  return (
    <div className="relative">
      {/* Pointer */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10">
        <div 
          className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[35px] border-l-transparent border-r-transparent border-t-amber-400"
          style={{
            filter: 'drop-shadow(0 0 10px #fbbf24) drop-shadow(0 0 20px #fbbf24)'
          }}
        />
      </div>
      
      {/* Wheel */}
      <canvas
        ref={canvasRef}
        width={360}
        height={360}
        className="max-w-full h-auto"
        style={{
          filter: isSpinning 
            ? 'drop-shadow(0 0 30px #a855f7) drop-shadow(0 0 60px #a855f7)'
            : 'drop-shadow(0 0 15px #a855f7) drop-shadow(0 0 30px #a855f780)'
        }}
      />

      {/* Decorative lights - loaded client-side only */}
      <DecorativeLights />
    </div>
  )
}
