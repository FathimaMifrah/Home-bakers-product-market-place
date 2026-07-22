/*
 File: server/seed_products.js
 Purpose: Server-side Node.js code for API, database, or app setup.
 Main exports: Exports or main definitions
 */

import { query, pool } from './db.js';


async function seedProducts() {
  try {
    console.log('Seeding Sri Lankan sweets to bakers...');

    const items = [
      { name: 'Malu Paan (Fish Bun)', desc: 'Soft triangular bun filled with a spicy, savory fish and potato curry.', img: 'https://images.unsplash.com/photo-1598114514800-4740e53a5cce?auto=format&fit=crop&w=600&q=80', cat: 'savory' },
      { name: 'Kimbula Banis', desc: 'Iconic Sri Lankan crocodile-shaped sweet bun sprinkled with sugar.', img: 'https://images.unsplash.com/photo-1509365465985-25d11c17e812?auto=format&fit=crop&w=600&q=80', cat: 'sweet' },
      { name: 'Sri Lankan Love Cake', desc: 'Traditional rich cake made with semolina, cashews, honey, and spices.', img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80', cat: 'cakes' },
      { name: 'Seeni Sambol Bun', desc: 'Fluffy bun stuffed with sweet and spicy caramelized onion sambol.', img: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80', cat: 'savory' },
      { name: 'Butter Cake', desc: 'Classic Sri Lankan soft butter cake, perfect with a cup of Ceylon tea.', img: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=600&q=80', cat: 'cakes' },
      { name: 'Tea Bun', desc: 'Classic Sri Lankan sweet tea bun, perfectly baked with a golden crust.', img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=600&q=80', cat: 'sweet' },
      { name: 'Chocolate Biscuit Pudding', desc: 'A beloved Sri Lankan dessert with layers of Marie biscuits and rich chocolate cream.', img: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80', cat: 'sweet' },
      { name: 'Jaggery Hopper (Hakuru Appa)', desc: 'Sweet bowl-shaped pancake made with rice flour, coconut milk, and kithul jaggery.', img: 'https://images.unsplash.com/photo-1589367920969-ab8e050eb0e9?auto=format&fit=crop&w=600&q=80', cat: 'sweet' },
      { name: 'Vade', desc: 'Crispy deep-fried savory lentil fritters spiced with curry leaves and chilies.', img: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?auto=format&fit=crop&w=600&q=80', cat: 'savory' },
    ];

    const bakers = ['user_baker_1', 'user_baker_2'];
    
    // Clear old products
    await query('DELETE FROM products');

    let counter = 1;
    for (const item of items) {
      // Add to baker 1
      await query(
        `INSERT INTO products (id, baker_id, name, description, price, category, image_url, stock, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`prod_sri_1_${counter}`, bakers[0], item.name, item.desc, Math.floor(Math.random() * 50) + 100, item.cat, item.img, 50, 1]
      );
      
      // Add to baker 2 (with slightly different price)
      await query(
        `INSERT INTO products (id, baker_id, name, description, price, category, image_url, stock, is_available) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`prod_sri_2_${counter}`, bakers[1], item.name, item.desc, Math.floor(Math.random() * 50) + 110, item.cat, item.img, 40, 1]
      );
      
      counter++;
    }

    console.log(`Successfully added 18 products! Each baker now sells these traditional sweets.`);
  } catch (err) {
    console.error('Error seeding products:', err);
  } finally {
    await pool.end();
  }
}

seedProducts();