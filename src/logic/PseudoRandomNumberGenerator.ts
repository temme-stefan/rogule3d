/**
 * Seeded Random Number Generator basierend auf einem angepassten Mulberry32 Algorithmus
 */
export class SeededRandom {
    state: number;

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

    /**
     * Wählt ein zufälliges Element aus einem Array von Paaren von Werten und Gewichtung
     * @param array Array von Tupeln [element, weight]
     * @returns Zufällig ausgewähltes Element basierend auf Gewichten
     */
    pickWeightedElement<T>(array: [T, number][]): T {
        if (array.length === 0) {
            throw new Error("Array cannot be empty");
        }

        // Überprüfe, dass alle Gewichte positiv sind
        for (const [_, weight] of array) {
            if (weight <= 0) {
                throw new Error("All weights must be positive");
            }
        }

        const totalWeight = array.reduce((sum, [_, weight]) => sum + weight, 0);

        let random = this.nextInRange(0, totalWeight);

        for (const [element, weight] of array) {
            random -= weight;
            if (random <= 0) {
                return element;
            }
        }
        // Due to JS rounding this is a fallback. TotalWeight might be bigger than the sum of weights.
        // example: 0.1+0.2 => 0.30000000000000004
        return array[array.length - 1][0];
    }
}