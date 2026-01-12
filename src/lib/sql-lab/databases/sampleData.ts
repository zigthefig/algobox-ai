// Sample E-commerce Database
export const ecommerceDB = {
    name: "E-commerce",
    tables: {
        users: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "email", type: "TEXT" },
                { name: "created_at", type: "DATE" },
            ],
            data: [
                { id: 1, name: "Alice Johnson", email: "alice@example.com", created_at: "2024-01-15" },
                { id: 2, name: "Bob Smith", email: "bob@example.com", created_at: "2024-02-20" },
                { id: 3, name: "Carol White", email: "carol@example.com", created_at: "2024-03-10" },
                { id: 4, name: "David Brown", email: "david@example.com", created_at: "2024-04-05" },
                { id: 5, name: "Eve Davis", email: "eve@example.com", created_at: "2024-05-12" },
            ],
        },
        products: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "price", type: "DECIMAL" },
                { name: "category", type: "TEXT" },
            ],
            data: [
                { id: 1, name: "Laptop Pro", price: 1299.99, category: "Electronics" },
                { id: 2, name: "Wireless Mouse", price: 29.99, category: "Electronics" },
                { id: 3, name: "Coffee Maker", price: 89.99, category: "Appliances" },
                { id: 4, name: "Running Shoes", price: 119.99, category: "Sports" },
                { id: 5, name: "Desk Chair", price: 249.99, category: "Furniture" },
            ],
        },
        orders: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "user_id", type: "INTEGER", foreignKey: { table: "users", column: "id" } },
                { name: "product_id", type: "INTEGER", foreignKey: { table: "products", column: "id" } },
                { name: "amount", type: "DECIMAL" },
                { name: "order_date", type: "DATE" },
            ],
            data: [
                { id: 1, user_id: 1, product_id: 1, amount: 1299.99, order_date: "2024-06-01" },
                { id: 2, user_id: 1, product_id: 2, amount: 29.99, order_date: "2024-06-01" },
                { id: 3, user_id: 2, product_id: 3, amount: 89.99, order_date: "2024-06-05" },
                { id: 4, user_id: 3, product_id: 4, amount: 119.99, order_date: "2024-06-10" },
                { id: 5, user_id: 4, product_id: 5, amount: 249.99, order_date: "2024-06-15" },
                { id: 6, user_id: 2, product_id: 1, amount: 1299.99, order_date: "2024-06-20" },
                { id: 7, user_id: 5, product_id: 2, amount: 29.99, order_date: "2024-06-25" },
            ],
        },
    },
};

// Sample School Database
export const schoolDB = {
    name: "School",
    tables: {
        students: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "grade", type: "INTEGER" },
                { name: "class_id", type: "INTEGER", foreignKey: { table: "classes", column: "id" } },
            ],
            data: [
                { id: 1, name: "John Doe", grade: 10, class_id: 1 },
                { id: 2, name: "Jane Smith", grade: 10, class_id: 1 },
                { id: 3, name: "Mike Wilson", grade: 11, class_id: 2 },
                { id: 4, name: "Sarah Connor", grade: 11, class_id: 2 },
                { id: 5, name: "Tom Hardy", grade: 12, class_id: 3 },
            ],
        },
        classes: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "teacher", type: "TEXT" },
            ],
            data: [
                { id: 1, name: "10-A", teacher: "Mr. Anderson" },
                { id: 2, name: "11-B", teacher: "Ms. Williams" },
                { id: 3, name: "12-A", teacher: "Dr. Smith" },
            ],
        },
        marks: {
            columns: [
                { name: "student_id", type: "INTEGER", foreignKey: { table: "students", column: "id" } },
                { name: "subject", type: "TEXT" },
                { name: "score", type: "INTEGER" },
            ],
            data: [
                { student_id: 1, subject: "Math", score: 85 },
                { student_id: 1, subject: "Science", score: 92 },
                { student_id: 2, subject: "Math", score: 78 },
                { student_id: 2, subject: "Science", score: 88 },
                { student_id: 3, subject: "Math", score: 95 },
                { student_id: 3, subject: "Science", score: 91 },
                { student_id: 4, subject: "Math", score: 72 },
                { student_id: 4, subject: "Science", score: 80 },
                { student_id: 5, subject: "Math", score: 88 },
                { student_id: 5, subject: "Science", score: 94 },
            ],
        },
    },
};

// Sample Company Database
export const companyDB = {
    name: "Company",
    tables: {
        employees: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "department_id", type: "INTEGER", foreignKey: { table: "departments", column: "id" } },
                { name: "salary", type: "DECIMAL" },
                { name: "hire_date", type: "DATE" },
            ],
            data: [
                { id: 1, name: "Emma Watson", department_id: 1, salary: 75000, hire_date: "2022-01-15" },
                { id: 2, name: "James Bond", department_id: 1, salary: 85000, hire_date: "2021-06-20" },
                { id: 3, name: "Bruce Wayne", department_id: 2, salary: 120000, hire_date: "2020-03-10" },
                { id: 4, name: "Diana Prince", department_id: 2, salary: 95000, hire_date: "2021-09-05" },
                { id: 5, name: "Clark Kent", department_id: 3, salary: 65000, hire_date: "2023-01-20" },
            ],
        },
        departments: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "manager_id", type: "INTEGER" },
            ],
            data: [
                { id: 1, name: "Engineering", manager_id: 2 },
                { id: 2, name: "Finance", manager_id: 3 },
                { id: 3, name: "Marketing", manager_id: 5 },
            ],
        },
        projects: {
            columns: [
                { name: "id", type: "INTEGER", primaryKey: true },
                { name: "name", type: "TEXT" },
                { name: "department_id", type: "INTEGER", foreignKey: { table: "departments", column: "id" } },
                { name: "budget", type: "DECIMAL" },
            ],
            data: [
                { id: 1, name: "Website Redesign", department_id: 1, budget: 50000 },
                { id: 2, name: "Mobile App", department_id: 1, budget: 100000 },
                { id: 3, name: "Annual Report", department_id: 2, budget: 15000 },
                { id: 4, name: "Brand Campaign", department_id: 3, budget: 75000 },
            ],
        },
    },
};

// Database registry
export const databases = {
    ecommerce: ecommerceDB,
    school: schoolDB,
    company: companyDB,
};

export type Database = typeof ecommerceDB;
export type TableData = Database["tables"][keyof Database["tables"]];
