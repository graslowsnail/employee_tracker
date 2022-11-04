const db = require("./db/connection.js");
const inquirer = require("inquirer");
// const validate = require("./javascript/validate");

// Database Connect and Starter Title
db.connect((error) => {
  if (error) throw error;

  promptUser();
});

// Prompt User for Choices
const promptUser = () => {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "Please select an option:",
        choices: [
          "View All Employees",
          "View All Roles",
          "View All Departments",
          "View Department Budgets",
          "Add Employee",
          "Add Role",
          "Add Department",
          "Exit",
        ],
      },
    ])
    .then((answers) => {
      const { choices } = answers;

      if (choices === "View All Employees") {
        viewAllEmployees();
      }

      if (choices === "View All Departments") {
        viewAllDepartments();
      }

      if (choices === "Add Employee") {
        addEmployee();
      }

      if (choices === "View All Roles") {
        viewAllRoles();
      }

      if (choices === "Add Role") {
        addRole();
      }

      if (choices === "Add Department") {
        addDepartment();
      }

      if (choices === "Exit") {
        db.end();
      }
    });
};

// View All Employees
const viewAllEmployees = () => {
  let sql = `SELECT employee.id, 
                  employee.first_name, 
                  employee.last_name, 
                  role.title, 
                  department.department_name AS 'department', 
                  role.salary
                  FROM employee, role, department 
                  WHERE department.id = role.department_id 
                  AND role.id = employee.role_id
                  ORDER BY employee.id ASC`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.log("Response: ", response);
    promptUser();
  });
};

// View all Roles
const viewAllRoles = () => {
  console.log(`Current Employee Roles:`);

  const sql = `SELECT role.id, role.title, department.department_name AS department
                  FROM role
                  INNER JOIN department ON role.department_id = department.id`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.log("Response: ", response);
    promptUser();
  });
};

// View all Departments
const viewAllDepartments = () => {
  const sql = `SELECT department.id AS id, department.department_name AS department FROM department`;
  db.query(sql, (error, response) => {
    if (error) throw error;
    console.log("Response: ", response);

    console.log(`All Departments:`);

    console.table(response);

    promptUser();
  });
};

// Add a New Employee
const addEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "fistName",
        message: "What is the employee's first name?",
        validate: (addFirstName) => {
          if (addFirstName) {
            return true;
          } else {
            console.log("Please enter a first name");
            return false;
          }
        },
      },
      {
        type: "input",
        name: "lastName",
        message: "What is the employee's last name?",
        validate: (addLastName) => {
          if (addLastName) {
            return true;
          } else {
            console.log("Please enter a last name");
            return false;
          }
        },
      },
    ])
    .then((answer) => {
      const crit = [answer.fistName, answer.lastName];
      const roleSql = `SELECT role.id, role.title FROM role`;
      db.query(roleSql, (error, data) => {
        if (error) throw error;
        const roles = data.map(({ id, title }) => ({ name: title, value: id }));
        inquirer
          .prompt([
            {
              type: "list",
              name: "role",
              message: "What is the employee's role?",
              choices: roles,
            },
          ])
          .then((roleChoice) => {
            const role = roleChoice.role;
            crit.push(role);
            const managerSql = `SELECT * FROM employee`;
            db.query(managerSql, (error, data) => {
              if (error) throw error;
              const managers = data.map(({ id, first_name, last_name }) => ({
                name: first_name + " " + last_name,
                value: id,
              }));
              inquirer
                .prompt([
                  {
                    type: "list",
                    name: "manager",
                    message: "Who is the employee's manager?",
                    choices: managers,
                  },
                ])
                .then((managerChoice) => {
                  const manager = managerChoice.manager;
                  crit.push(manager);
                  const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                                  VALUES (?, ?, ?, ?)`;
                  db.query(sql, crit, (error) => {
                    if (error) throw error;
                    console.log("Employee has been added!");
                    viewAllEmployees();
                  });
                });
            });
          });
      });
    });
};

// Add a New Role
const addRole = () => {
  const sql = "SELECT * FROM department";
  db.query(sql, (error, response) => {
    if (error) throw error;
    let deptNamesArray = [];
    response.forEach((department) => {
      deptNamesArray.push(department.department_name);
    });
    deptNamesArray.push("Create Department");
    inquirer
      .prompt([
        {
          name: "departmentName",
          type: "list",
          message: "Which department is this new role in?",
          choices: deptNamesArray,
        },
      ])
      .then((answer) => {
        if (answer.departmentName === "Create Department") {
          this.addDepartment();
        } else {
          addRoleResume(answer);
        }
      });

    const addRoleResume = (departmentData) => {
      inquirer
        .prompt([
          {
            name: "newRole",
            type: "input",
            message: "What is the name of your new role?",
            validate: validate.validateString,
          },
          {
            name: "salary",
            type: "input",
            message: "What is the salary of this new role?",
            validate: validate.validateSalary,
          },
        ])
        .then((answer) => {
          let createdRole = answer.newRole;
          let departmentId;

          response.forEach((department) => {
            if (departmentData.departmentName === department.department_name) {
              departmentId = department.id;
            }
          });

          let sql = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
          let crit = [createdRole, answer.salary, departmentId];

          db.query(sql, crit, (error) => {
            if (error) throw error;

            console.log(`Role successfully created!`);

            viewAllRoles();
          });
        });
    };
  });
};

// Add a New Department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: "newDepartment",
        type: "input",
        message: "What is the name of your new Department?",
        validate: validate.validateString,
      },
    ])
    .then((answer) => {
      let sql = `INSERT INTO department (department_name) VALUES (?)`;
      db.query(sql, answer.newDepartment, (error) => {
        if (error) throw error;
        console.log(``);
        console.log(answer.newDepartment + ` Department successfully created!`);
        console.log(``);
        viewAllDepartments();
      });
    });
};
