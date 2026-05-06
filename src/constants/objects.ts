import { Character } from '../types';

export const STANDARD_OBJECTS: Character[] = [
  {
    id: 'obj-door',
    name: '침실 문',
    height: 200,
    width: 80,
    gender: 'object',
    description: '80cm × 200cm',
    notionUrl: '',
    color: '#D1D5DB',
    isObject: true
  },
  {
    id: 'obj-bed',
    name: '싱글 침대',
    height: 200,
    width: 110,
    gender: 'object',
    description: '110cm × 200cm',
    notionUrl: '',
    color: '#93C5FD',
    isObject: true
  },
  {
    id: 'obj-car',
    name: '승용차',
    height: 200,
    width: 470,
    gender: 'object',
    description: '470cm ×200cm',
    notionUrl: '',
    color: '#9CA3AF',
    isObject: true
  },
  {
    id: 'obj-chalkboard',
    name: '칠판',
    height: 120,
    width: 360,
    yOffset: 80, // 80cm from floor
    gender: 'object',
    description: '360cm × 120cm (바닥에서 80cm)',
    notionUrl: '',
    color: '#065F46',
    isObject: true
  }
];
