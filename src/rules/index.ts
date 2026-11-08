import type { Rule } from '../types.js';
import { projectRule } from './project.js';
import { javaRule } from './java.js';
import { gradleRule } from './gradle.js';
import { androidSdkRule } from './android-sdk.js';
import { kotlinRule } from './kotlin.js';
import { memoryRule } from './memory.js';
import { xcodeRule } from './xcode.js';
import { cocoapodsRule } from './cocoapods.js';
import { iosTargetRule } from './ios-target.js';

export const ALL_RULES: Rule[] = [
  projectRule,
  javaRule,
  gradleRule,
  androidSdkRule,
  kotlinRule,
  memoryRule,
  xcodeRule,
  cocoapodsRule,
  iosTargetRule,
];

export {
  projectRule,
  javaRule,
  gradleRule,
  androidSdkRule,
  kotlinRule,
  memoryRule,
  xcodeRule,
  cocoapodsRule,
  iosTargetRule,
};
