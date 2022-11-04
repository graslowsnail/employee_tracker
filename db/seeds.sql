INSERT INTO department(department_name)
VALUES("Engineering"), ("Sales"), ("Finance"), ("Legal"), ("Tech");

INSERT INTO role(title, salary, department_id)
VALUES("Engineer", 85000, 1), ("Senior Engineer", 125000, 1), ("CFO", 350000, 3), ("CTO", 300000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id)
VALUES ('Pablo', 'Ramirez', 1, 2), ('liam', 'amadio', 1, null), ('sergio', 'agular', 1, 2), ('brooke', 'ramirez', 2, 2), ('carl', 'mapa', 4, null);

