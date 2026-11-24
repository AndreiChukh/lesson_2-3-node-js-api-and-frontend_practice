import { mkdir, readFile, writeFile, rename, rm, unlink } from 'node:fs/promises'
import { isBookingArray, initialBookings } from '../../src/models/booking.ts'
import type { Booking } from '../../src/models/booking.ts'
import { dataDir, dataFile, failFile } from '../paths.ts'

export async function readBookings(): Promise<Booking[]> {
  let text: string

  try {
    text = await readFile(dataFile, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
    const rows = initialBookings()
    await writeBookings(rows)
    return rows
  }

  // START FILE-READ
  const parsed: unknown = JSON.parse(text)
  if (!isBookingArray(parsed)) throw new Error('Файл содержит неверный список заявок.')
  return parsed
  // END FILE-READ
}

export async function writeBookings(rows: Booking[]): Promise<void> {
  await mkdir(dataDir, { recursive: true })

  try {
    await unlink(failFile)
    throw new Error('Учебный сбой записи: маркер использован.')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }

  const temporary = dataFile + '.tmp'

  try {
    // START FILE-WRITE
    await writeFile(temporary, JSON.stringify(rows, null, 2) + '\n', 'utf8')
    // END FILE-WRITE

    await rename(temporary, dataFile)
  } finally {
    await rm(temporary, { force: true })
  }
}
