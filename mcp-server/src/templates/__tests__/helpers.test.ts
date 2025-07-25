import { describe, it, expect, beforeEach, vi } from 'vitest';
import Handlebars from 'handlebars';
import { registerHelpers } from '../helpers/index.js';

describe('Handlebars Helpers', () => {
  beforeEach(() => {
    // Register helpers on the global Handlebars instance
    registerHelpers();
  });

  describe('eq (equality) helper', () => {
    it('should return true for equal values', () => {
      const template = Handlebars.compile('{{#if (eq a b)}}equal{{else}}not equal{{/if}}');
      
      expect(template({ a: 5, b: 5 })).toBe('equal');
      expect(template({ a: 'test', b: 'test' })).toBe('equal');
      expect(template({ a: true, b: true })).toBe('equal');
      expect(template({ a: null, b: null })).toBe('equal');
    });

    it('should return false for different values', () => {
      const template = Handlebars.compile('{{#if (eq a b)}}equal{{else}}not equal{{/if}}');
      
      expect(template({ a: 5, b: 10 })).toBe('not equal');
      expect(template({ a: 'test', b: 'other' })).toBe('not equal');
      expect(template({ a: true, b: false })).toBe('not equal');
      expect(template({ a: null, b: undefined })).toBe('not equal');
    });

    it('should use strict equality', () => {
      const template = Handlebars.compile('{{#if (eq a b)}}equal{{else}}not equal{{/if}}');
      
      expect(template({ a: 5, b: '5' })).toBe('not equal');
      expect(template({ a: 0, b: false })).toBe('not equal');
      expect(template({ a: '', b: false })).toBe('not equal');
      expect(template({ a: '0', b: 0 })).toBe('not equal');
    });

    it('should work in unless blocks', () => {
      const template = Handlebars.compile('{{#unless (eq a b)}}different{{else}}same{{/unless}}');
      
      expect(template({ a: 1, b: 2 })).toBe('different');
      expect(template({ a: 1, b: 1 })).toBe('same');
    });
  });

  describe('lt (less than) helper', () => {
    it('should return true when first value is less than second', () => {
      const template = Handlebars.compile('{{#if (lt a b)}}less{{else}}not less{{/if}}');
      
      expect(template({ a: 5, b: 10 })).toBe('less');
      expect(template({ a: -10, b: -5 })).toBe('less');
      expect(template({ a: 0, b: 1 })).toBe('less');
      expect(template({ a: 'a', b: 'b' })).toBe('less');
    });

    it('should return false when first value is equal or greater', () => {
      const template = Handlebars.compile('{{#if (lt a b)}}less{{else}}not less{{/if}}');
      
      expect(template({ a: 10, b: 5 })).toBe('not less');
      expect(template({ a: 5, b: 5 })).toBe('not less');
      expect(template({ a: 'z', b: 'a' })).toBe('not less');
    });

    it('should handle edge cases', () => {
      const template = Handlebars.compile('{{#if (lt a b)}}less{{else}}not less{{/if}}');
      
      expect(template({ a: null, b: 0 })).toBe('not less');
      expect(template({ a: undefined, b: 0 })).toBe('not less');
      expect(template({ a: NaN, b: 5 })).toBe('not less');
    });
  });

  describe('lte (less than or equal) helper', () => {
    it('should return true when first value is less than or equal to second', () => {
      const template = Handlebars.compile('{{#if (lte a b)}}true{{else}}false{{/if}}');
      
      expect(template({ a: 5, b: 10 })).toBe('true');
      expect(template({ a: 10, b: 10 })).toBe('true');
      expect(template({ a: 'a', b: 'a' })).toBe('true');
    });

    it('should return false when first value is greater', () => {
      const template = Handlebars.compile('{{#if (lte a b)}}true{{else}}false{{/if}}');
      
      expect(template({ a: 15, b: 10 })).toBe('false');
      expect(template({ a: 'z', b: 'a' })).toBe('false');
    });
  });

  describe('gt (greater than) helper', () => {
    it('should return true when first value is greater than second', () => {
      const template = Handlebars.compile('{{#if (gt a b)}}greater{{else}}not greater{{/if}}');
      
      expect(template({ a: 10, b: 5 })).toBe('greater');
      expect(template({ a: -5, b: -10 })).toBe('greater');
      expect(template({ a: 'z', b: 'a' })).toBe('greater');
    });

    it('should return false when first value is equal or less', () => {
      const template = Handlebars.compile('{{#if (gt a b)}}greater{{else}}not greater{{/if}}');
      
      expect(template({ a: 5, b: 10 })).toBe('not greater');
      expect(template({ a: 5, b: 5 })).toBe('not greater');
    });
  });

  describe('gte (greater than or equal) helper', () => {
    it('should return true when first value is greater than or equal to second', () => {
      const template = Handlebars.compile('{{#if (gte a b)}}true{{else}}false{{/if}}');
      
      expect(template({ a: 10, b: 5 })).toBe('true');
      expect(template({ a: 5, b: 5 })).toBe('true');
      expect(template({ a: 'z', b: 'a' })).toBe('true');
    });

    it('should return false when first value is less', () => {
      const template = Handlebars.compile('{{#if (gte a b)}}true{{else}}false{{/if}}');
      
      expect(template({ a: 5, b: 10 })).toBe('false');
      expect(template({ a: 'a', b: 'z' })).toBe('false');
    });
  });

  describe('nested helper usage', () => {
    it('should work with nested conditionals', () => {
      const template = Handlebars.compile(`
        {{#if (gt score 90)}}
          A
        {{else if (gte score 80)}}
          B
        {{else if (gte score 70)}}
          C
        {{else if (gte score 60)}}
          D
        {{else}}
          F
        {{/if}}
      `);
      
      expect(template({ score: 95 }).trim()).toBe('A');
      expect(template({ score: 85 }).trim()).toBe('B');
      expect(template({ score: 75 }).trim()).toBe('C');
      expect(template({ score: 65 }).trim()).toBe('D');
      expect(template({ score: 55 }).trim()).toBe('F');
    });

    it('should work with complex conditions', () => {
      const template = Handlebars.compile(`
        {{#if (eq type "admin")}}
          {{#if (gt level 5)}}
            Super Admin
          {{else}}
            Regular Admin
          {{/if}}
        {{else if (eq type "user")}}
          {{#if (gte posts 100)}}
            Power User
          {{else}}
            Regular User
          {{/if}}
        {{else}}
          Guest
        {{/if}}
      `);
      
      expect(template({ type: 'admin', level: 10 }).trim()).toBe('Super Admin');
      expect(template({ type: 'admin', level: 3 }).trim()).toBe('Regular Admin');
      expect(template({ type: 'user', posts: 150 }).trim()).toBe('Power User');
      expect(template({ type: 'user', posts: 50 }).trim()).toBe('Regular User');
      expect(template({ type: 'guest' }).trim()).toBe('Guest');
    });
  });

  describe('helper with missing values', () => {
    it('should handle undefined values gracefully', () => {
      const template = Handlebars.compile('{{#if (eq a b)}}equal{{else}}not equal{{/if}}');
      
      expect(template({ a: undefined, b: undefined })).toBe('equal');
      expect(template({ a: 5 })).toBe('not equal'); // b is undefined
      expect(template({ b: 5 })).toBe('not equal'); // a is undefined
    });

    it('should handle comparison with undefined', () => {
      const template = Handlebars.compile('{{#if (lt a b)}}less{{else}}not less{{/if}}');
      
      expect(template({ a: 5 })).toBe('not less'); // b is undefined
      expect(template({ b: 5 })).toBe('not less'); // a is undefined
    });
  });

  describe('helpers in different contexts', () => {
    it('should work with array iteration', () => {
      const template = Handlebars.compile(`
        {{#each items}}
          {{#if (gt value ../threshold)}}
            {{name}}: Above
          {{else}}
            {{name}}: Below
          {{/if}}
        {{/each}}
      `);
      
      const result = template({
        threshold: 50,
        items: [
          { name: 'Item1', value: 60 },
          { name: 'Item2', value: 40 },
          { name: 'Item3', value: 70 }
        ]
      });
      
      expect(result).toContain('Item1: Above');
      expect(result).toContain('Item2: Below');
      expect(result).toContain('Item3: Above');
    });

    it('should access parent context in helpers', () => {
      const template = Handlebars.compile(`
        {{#each items}}
          {{#if (eq type ../selectedType)}}
            Selected: {{name}}
          {{/if}}
        {{/each}}
      `);
      
      const result = template({
        selectedType: 'typeA',
        items: [
          { name: 'Item1', type: 'typeA' },
          { name: 'Item2', type: 'typeB' },
          { name: 'Item3', type: 'typeA' }
        ]
      });
      
      expect(result).toContain('Selected: Item1');
      expect(result).not.toContain('Selected: Item2');
      expect(result).toContain('Selected: Item3');
    });
  });
});