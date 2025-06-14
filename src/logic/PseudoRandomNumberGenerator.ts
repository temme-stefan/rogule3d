/**
 * Seeded Random Number Generator basierend auf einem angepassten Mulberry32 Algorithmus
 */
export class SeededRandom {
  private state: number;

  /**
   * Konstruktor für den SeededRandom Generator
   * @param seed Seed als String, der in eine Zahl konvertiert wird
   */
  constructor(seed: string) {
    // Konvertiere den Seed-String in eine Zahl
    this.state = this.hashString(seed);
  }

  /**
   * Konvertiert einen String in eine Zahl für den initialen Seed
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Konvertiere zu 32bit Integer
    }
    return Math.abs(hash);
  }

  /**
   * Generiert die nächste Pseudozufallszahl zwischen 0 (inklusive) und 1 (exklusive)
   */
  next(): number {
    // Mulberry32 Algorithmus
    let t = this.state += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }

  /**
   * Generiert eine Zufallszahl zwischen min (inklusive) und max (exklusive)
   */
  nextInRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generiert eine ganze Zufallszahl zwischen min (inklusive) und max (inklusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.nextInRange(min, max + 1));
  }

  /**
   * Wählt ein zufälliges Element aus einem Array
   */
  pickElement<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  /**
   * Erzeugt eine zufällige boolean-Wert mit einer bestimmten Wahrscheinlichkeit
   * @param probability Wahrscheinlichkeit für true (0-1)
   */
  chance(probability: number): boolean {
    return this.next() < probability;
  }
}