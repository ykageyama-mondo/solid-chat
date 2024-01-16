import clsx from 'clsx'
import {twMerge} from 'tailwind-merge'

export const cn = (...c: clsx.ClassValue[]) => twMerge(clsx(c))