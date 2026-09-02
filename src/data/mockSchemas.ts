import { PracticeQuestion, SqlDialect } from '../types.ts';

export interface DatabaseSchemaDefinition {
  id: string;
  name: string;
  description: string;
  tables: {
    name: string;
    description: string;
    columns: { name: string; type: string; key?: 'PK' | 'FK'; description: string }[];
    sampleData: Record<string, string | number | boolean | null>[];
  }[];
}

export const SAMPLE_SCHEMAS: DatabaseSchemaDefinition[] = [
  {
    id: 'ecommerce',
    name: 'E-Commerce & Orders Database',
    description: 'Relational schema for customers, orders, order items, and products.',
    tables: [
      {
        name: 'customers',
        description: 'Customer profiles and account information',
        columns: [
          { name: 'customer_id', type: 'INT', key: 'PK', description: 'Unique customer identifier' },
          { name: 'first_name', type: 'VARCHAR(50)', description: 'Customer first name' },
          { name: 'last_name', type: 'VARCHAR(50)', description: 'Customer last name' },
          { name: 'email', type: 'VARCHAR(100)', description: 'Unique email address' },
          { name: 'country', type: 'VARCHAR(50)', description: 'Country of residence' },
          { name: 'created_at', type: 'TIMESTAMP', description: 'Account creation timestamp' },
        ],
        sampleData: [
          { customer_id: 1, first_name: 'Alice', last_name: 'Johnson', email: 'alice@example.com', country: 'USA', created_at: '2023-01-15 10:30:00' },
          { customer_id: 2, first_name: 'Bob', last_name: 'Smith', email: 'bob@example.com', country: 'Canada', created_at: '2023-02-20 14:15:00' },
          { customer_id: 3, first_name: 'Clara', last_name: 'Diaz', email: 'clara@example.com', country: 'UK', created_at: '2023-03-10 09:00:00' },
          { customer_id: 4, first_name: 'David', last_name: 'Kim', email: 'david@example.com', country: 'USA', created_at: '2023-04-05 18:45:00' },
        ],
      },
      {
        name: 'orders',
        description: 'Placed customer orders and statuses',
        columns: [
          { name: 'order_id', type: 'INT', key: 'PK', description: 'Unique order ID' },
          { name: 'customer_id', type: 'INT', key: 'FK', description: 'References customers(customer_id)' },
          { name: 'order_date', type: 'TIMESTAMP', description: 'Order placement timestamp' },
          { name: 'total_amount', type: 'DECIMAL(10,2)', description: 'Total monetary value of order' },
          { name: 'status', type: 'VARCHAR(20)', description: 'Status: completed, pending, cancelled' },
        ],
        sampleData: [
          { order_id: 101, customer_id: 1, order_date: '2023-11-01 11:20:00', total_amount: 149.99, status: 'completed' },
          { order_id: 102, customer_id: 1, order_date: '2023-11-15 08:30:00', total_amount: 89.50, status: 'completed' },
          { order_id: 103, customer_id: 2, order_date: '2023-11-20 16:10:00', total_amount: 450.00, status: 'completed' },
          { order_id: 104, customer_id: 3, order_date: '2023-11-22 12:00:00', total_amount: 25.00, status: 'cancelled' },
          { order_id: 105, customer_id: 4, order_date: '2023-12-01 19:40:00', total_amount: 320.75, status: 'pending' },
        ],
      },
      {
        name: 'order_items',
        description: 'Line items belonging to each order',
        columns: [
          { name: 'item_id', type: 'INT', key: 'PK', description: 'Unique item identifier' },
          { name: 'order_id', type: 'INT', key: 'FK', description: 'References orders(order_id)' },
          { name: 'product_id', type: 'INT', key: 'FK', description: 'References products(product_id)' },
          { name: 'quantity', type: 'INT', description: 'Quantity ordered' },
          { name: 'unit_price', type: 'DECIMAL(10,2)', description: 'Price per unit at purchase' },
        ],
        sampleData: [
          { item_id: 1, order_id: 101, product_id: 201, quantity: 1, unit_price: 149.99 },
          { item_id: 2, order_id: 102, product_id: 202, quantity: 2, unit_price: 44.75 },
          { item_id: 3, order_id: 103, product_id: 203, quantity: 1, unit_price: 450.00 },
        ],
      },
      {
        name: 'products',
        description: 'Catalog products and stock levels',
        columns: [
          { name: 'product_id', type: 'INT', key: 'PK', description: 'Unique product ID' },
          { name: 'product_name', type: 'VARCHAR(100)', description: 'Product title' },
          { name: 'category', type: 'VARCHAR(50)', description: 'Category (Electronics, Apparel, etc.)' },
          { name: 'price', type: 'DECIMAL(10,2)', description: 'Current unit selling price' },
          { name: 'stock_quantity', type: 'INT', description: 'Available inventory count' },
        ],
        sampleData: [
          { product_id: 201, product_name: 'Wireless Noise-Canceling Headphones', category: 'Electronics', price: 149.99, stock_quantity: 45 },
          { product_id: 202, product_name: 'Mechanical Gaming Keyboard', category: 'Electronics', price: 44.75, stock_quantity: 120 },
          { product_id: 203, product_name: '4K Ultra-HD Monitor 27"', category: 'Electronics', price: 450.00, stock_quantity: 18 },
          { product_id: 204, product_name: 'Ergonomic Office Chair', category: 'Furniture', price: 280.00, stock_quantity: 32 },
        ],
      },
    ],
  },
  {
    id: 'hr_payroll',
    name: 'HR & Employee Salaries Database',
    description: 'Schema for departments, employees, salary bands, and performance ratings.',
    tables: [
      {
        name: 'departments',
        description: 'Company organizational departments',
        columns: [
          { name: 'department_id', type: 'INT', key: 'PK', description: 'Department unique ID' },
          { name: 'department_name', type: 'VARCHAR(50)', description: 'Name of the department' },
          { name: 'location', type: 'VARCHAR(100)', description: 'Office city/campus' },
        ],
        sampleData: [
          { department_id: 1, department_name: 'Engineering', location: 'San Francisco, CA' },
          { department_id: 2, department_name: 'Product & Design', location: 'New York, NY' },
          { department_id: 3, department_name: 'Marketing & Growth', location: 'Austin, TX' },
          { department_id: 4, department_name: 'Sales', location: 'London, UK' },
        ],
      },
      {
        name: 'employees',
        description: 'Employee directory with managerial reporting hierarchy',
        columns: [
          { name: 'employee_id', type: 'INT', key: 'PK', description: 'Unique employee ID' },
          { name: 'name', type: 'VARCHAR(100)', description: 'Full legal name' },
          { name: 'department_id', type: 'INT', key: 'FK', description: 'References departments(department_id)' },
          { name: 'manager_id', type: 'INT', key: 'FK', description: 'Self-referential manager employee ID' },
          { name: 'job_title', type: 'VARCHAR(50)', description: 'Role title' },
          { name: 'salary', type: 'DECIMAL(12,2)', description: 'Annual base salary USD' },
          { name: 'hire_date', type: 'DATE', description: 'Date joined company' },
        ],
        sampleData: [
          { employee_id: 1, name: 'Sarah Chen', department_id: 1, manager_id: null, job_title: 'VP of Engineering', salary: 210000, hire_date: '2020-03-01' },
          { employee_id: 2, name: 'Marcus Taylor', department_id: 1, manager_id: 1, job_title: 'Staff Software Engineer', salary: 185000, hire_date: '2021-06-15' },
          { employee_id: 3, name: 'Elena Rostova', department_id: 1, manager_id: 2, job_title: 'Senior Frontend Engineer', salary: 145000, hire_date: '2022-01-10' },
          { employee_id: 4, name: 'Jamal Washington', department_id: 2, manager_id: null, job_title: 'Head of Product', salary: 195000, hire_date: '2019-11-20' },
          { employee_id: 5, name: 'Aisha Patel', department_id: 3, manager_id: null, job_title: 'Director of Marketing', salary: 160000, hire_date: '2021-08-01' },
        ],
      },
    ],
  },
];

export const PRESET_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 'q-beg-1',
    title: 'Top 5 Highest Paid Employees',
    difficulty: 'Beginner',
    category: 'Ordering & Filtering',
    problem: 'Write a query to retrieve the name, job_title, and salary of the top 5 highest-earning employees from the `employees` table, sorted from highest salary to lowest.',
    schema: {
      tables: [
        {
          name: 'employees',
          columns: [
            { name: 'employee_id', type: 'INT', isPrimary: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'job_title', type: 'VARCHAR(50)' },
            { name: 'salary', type: 'DECIMAL(12,2)' },
            { name: 'department_id', type: 'INT' },
          ],
          sampleRows: [
            { employee_id: 1, name: 'Sarah Chen', job_title: 'VP of Engineering', salary: 210000, department_id: 1 },
            { employee_id: 2, name: 'Marcus Taylor', job_title: 'Staff Software Engineer', salary: 185000, department_id: 1 },
            { employee_id: 3, name: 'Jamal Washington', job_title: 'Head of Product', salary: 195000, department_id: 2 },
            { employee_id: 4, name: 'Aisha Patel', job_title: 'Director of Marketing', salary: 160000, department_id: 3 },
            { employee_id: 5, name: 'Elena Rostova', job_title: 'Senior Frontend Engineer', salary: 145000, department_id: 1 },
            { employee_id: 6, name: 'David Kim', job_title: 'Junior DevOps', salary: 95000, department_id: 1 },
          ],
        },
      ],
    },
    hint: 'Use ORDER BY salary DESC and LIMIT 5 (or TOP 5 depending on dialect).',
    starterSql: `-- Write your SQL query here
SELECT name, job_title, salary
FROM employees
`,
  },
  {
    id: 'q-int-1',
    title: 'Total Revenue by Customer Country',
    difficulty: 'Intermediate',
    category: 'JOINs & Aggregations',
    problem: 'Calculate the total amount spent on completed orders per customer country. Display the country name and total_spent. Only include countries with total spending greater than $200, ordered by total_spent descending.',
    schema: {
      tables: [
        {
          name: 'customers',
          columns: [
            { name: 'customer_id', type: 'INT', isPrimary: true },
            { name: 'first_name', type: 'VARCHAR(50)' },
            { name: 'country', type: 'VARCHAR(50)' },
          ],
          sampleRows: [
            { customer_id: 1, first_name: 'Alice', country: 'USA' },
            { customer_id: 2, first_name: 'Bob', country: 'Canada' },
            { customer_id: 3, first_name: 'Clara', country: 'UK' },
            { customer_id: 4, first_name: 'David', country: 'USA' },
          ],
        },
        {
          name: 'orders',
          columns: [
            { name: 'order_id', type: 'INT', isPrimary: true },
            { name: 'customer_id', type: 'INT', isForeign: true },
            { name: 'total_amount', type: 'DECIMAL(10,2)' },
            { name: 'status', type: 'VARCHAR(20)' },
          ],
          sampleRows: [
            { order_id: 101, customer_id: 1, total_amount: 150.00, status: 'completed' },
            { order_id: 102, customer_id: 1, total_amount: 90.00, status: 'completed' },
            { order_id: 103, customer_id: 2, total_amount: 450.00, status: 'completed' },
            { order_id: 104, customer_id: 3, total_amount: 30.00, status: 'cancelled' },
          ],
        },
      ],
    },
    hint: 'Join customers with orders on customer_id, filter by status = "completed", GROUP BY country, and filter aggregate totals using HAVING SUM(total_amount) > 200.',
    starterSql: `-- Write your SQL query here
SELECT c.country, SUM(o.total_amount) AS total_spent
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
`,
  },
  {
    id: 'q-adv-1',
    title: 'Department Salary Ranking with Window Functions',
    difficulty: 'Advanced',
    category: 'Window Functions & Ranking',
    problem: 'For every employee, find their salary ranking within their specific department using a dense rank. Return employee name, department name, salary, and their department_salary_rank (where 1 is the highest salary in that department).',
    schema: {
      tables: [
        {
          name: 'departments',
          columns: [
            { name: 'department_id', type: 'INT', isPrimary: true },
            { name: 'department_name', type: 'VARCHAR(50)' },
          ],
          sampleRows: [
            { department_id: 1, department_name: 'Engineering' },
            { department_id: 2, department_name: 'Marketing' },
          ],
        },
        {
          name: 'employees',
          columns: [
            { name: 'employee_id', type: 'INT', isPrimary: true },
            { name: 'name', type: 'VARCHAR(100)' },
            { name: 'department_id', type: 'INT', isForeign: true },
            { name: 'salary', type: 'DECIMAL(12,2)' },
          ],
          sampleRows: [
            { employee_id: 1, name: 'Sarah', department_id: 1, salary: 210000 },
            { employee_id: 2, name: 'Marcus', department_id: 1, salary: 185000 },
            { employee_id: 3, name: 'Elena', department_id: 1, salary: 145000 },
            { employee_id: 4, name: 'Aisha', department_id: 2, salary: 160000 },
            { employee_id: 5, name: 'Tom', department_id: 2, salary: 120000 },
          ],
        },
      ],
    },
    hint: 'Use DENSE_RANK() OVER (PARTITION BY e.department_id ORDER BY e.salary DESC) and JOIN departments.',
    starterSql: `-- Write your SQL query with Window Function
SELECT 
  e.name,
  d.department_name,
  e.salary,
  DENSE_RANK() OVER (
    PARTITION BY e.department_id 
    ORDER BY e.salary DESC
  ) AS department_salary_rank
FROM employees e
JOIN departments d ON e.department_id = d.department_id;
`,
  },
];

export const SQL_DIALECTS: SqlDialect[] = [
  'PostgreSQL',
  'MySQL',
  'SQLite',
  'SQL Server',
  'Oracle',
];

export const FEATURE_PROMPTS = [
  {
    title: 'Top 5 Highest Paid Employees',
    dialect: 'PostgreSQL' as SqlDialect,
    prompt: 'Find the top 5 employees with the highest salary from the employees table, including their name, job title, and salary.',
  },
  {
    title: 'Monthly Recurring Revenue (MRR) by Cohort',
    dialect: 'PostgreSQL' as SqlDialect,
    prompt: 'Calculate monthly recurring subscription revenue grouped by the customer registration cohort month over the last 12 months.',
  },
  {
    title: 'Customers with No Orders in 90 Days',
    dialect: 'MySQL' as SqlDialect,
    prompt: 'Find all active customer emails who registered over 6 months ago but have placed zero orders in the last 90 days.',
  },
  {
    title: 'Find Duplicate Emails in User Table',
    dialect: 'SQLite' as SqlDialect,
    prompt: 'Identify all duplicate email addresses in the users table along with the count of occurrences and list of user IDs.',
  },
  {
    title: 'Average Order Value by Product Category',
    dialect: 'SQL Server' as SqlDialect,
    prompt: 'Join products, order_items, and orders to compute total revenue and average order basket value per product category for 2024.',
  },
];
