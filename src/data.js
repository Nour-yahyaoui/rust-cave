// Course content. t = text, h = heading, c = code.
const t = (s) => ['t', s];
const h = (s) => ['h', s];
const c = (s) => ['c', s];
// M = multiple choice (o = options, a = correct index), F = fill the blank (ans = accepted answers)
const M = (q, o, a, w) => ({ k: 'mcq', q, o, a, w });
const F = (q, code, ans, w) => ({ k: 'fill', q, code, ans, w });

export const MODULES = [
  {
    id: 'm1',
    title: 'Rust Foundations',
    icon: 'construct',
    lessons: [
      {
        id: 'cargo', title: 'Hello, Cargo', min: 6,
        body: [
          t('Rust is a compiled, memory-safe systems language with no garbage collector. Cargo is its build tool and package manager.'),
          c('cargo new hello\ncd hello\ncargo run'),
          t('cargo new creates Cargo.toml (project info + dependencies) and src/main.rs.\n• cargo check: type-check only, fastest feedback\n• cargo build --release: optimised binary in target/release\n• cargo add <crate>: add a dependency'),
          c('fn main() {\n    println!("Hello, cave!");\n}'),
          t('println! ends with ! because it is a macro, not a function.'),
        ],
        quiz: [
          M('Which command type-checks your code fastest without producing a binary?', ['cargo run', 'cargo check', 'cargo new', 'cargo clean'], 1, 'cargo check skips code generation, so it is much faster than a build.'),
          F('Complete the entry point.', '____ main() {\n    println!("hi");\n}', ['fn'], 'fn declares a function; main is where the program starts.'),
        ],
      },
      {
        id: 'vars', title: 'Variables & Types', min: 8,
        body: [
          t('Variables are immutable by default. Add mut to allow change. Shadowing (let again) creates a brand new variable.'),
          c('let x = 5;          // immutable\nlet mut y = 10;    // mutable\ny += 1;\nlet x = x * 2;     // shadowing\nconst MAX: u32 = 100;\nlet big: u64 = 1_000_000;'),
          t('Scalar types: i8..i128, u8..u128, isize/usize, f32/f64, bool, char.\nText: &str (borrowed slice) and String (owned, growable).\nCompound: tuples (1, "a") and arrays [1, 2, 3].'),
        ],
        quiz: [
          M('What happens with: let x = 5; x = 6;', ['x becomes 6', 'Compile error', 'Runtime panic', 'A warning only'], 1, 'x is immutable, so reassigning it is rejected at compile time.'),
          F('Make this variable changeable.', 'let ____ count = 0;\ncount += 1;', ['mut'], 'mut opts a binding into mutability.'),
        ],
      },
      {
        id: 'flow', title: 'Functions & Control Flow', min: 8,
        body: [
          t('The last expression in a block, written WITHOUT a semicolon, is its return value. if is an expression too.'),
          c('fn add(a: i32, b: i32) -> i32 {\n    a + b\n}\n\nlet label = if add(1, 2) > 2 { "big" } else { "small" };\n\nfor i in 0..3 {}    // 0,1,2\nfor i in 0..=3 {}   // 0,1,2,3\nlet mut n = 0;\nwhile n < 3 { n += 1; }\nloop { break; }'),
        ],
        quiz: [
          M('What is wrong with: fn f() -> i32 { 5; }', ['Nothing, returns 5', 'The semicolon makes it return (), a type error', 'It returns 0', 'It panics'], 1, '5; is a statement, so the block evaluates to () instead of i32.'),
          F('Loop from 1 to 5 inclusive.', 'for i in 1____5 { }', ['..='], '..= is the inclusive range; .. excludes the end.'),
        ],
      },
      {
        id: 'own', title: 'Ownership', min: 10,
        body: [
          t('The heart of Rust. Three rules:\n• every value has one owner\n• only one owner at a time\n• when the owner goes out of scope the value is dropped (memory freed)'),
          c('let a = String::from("rust");\nlet b = a;          // ownership MOVES to b\n// println!("{a}"); // error: a was moved\nlet c = b.clone();  // explicit deep copy\nprintln!("{b} {c}");'),
          t('Simple types like integers, bool and char are Copy: they are duplicated instead of moved. This is how Rust frees memory deterministically with no garbage collector, and it is why servers written in Rust are so predictable.'),
        ],
        quiz: [
          M('After let b = a; (a is a String), what can you do with a?', ['Use it normally', 'Nothing, it was moved', 'Only read it', 'Only mutate it'], 1, 'Assignment moves the String; a is no longer valid.'),
          F('Keep a usable by copying the data.', 'let b = a.____();', ['clone', 'clone()'], 'clone() makes a deep copy so both variables own their data.'),
        ],
      },
      {
        id: 'borrow', title: 'Borrowing & References', min: 10,
        body: [
          t('A reference borrows a value without owning it. At any time you may have EITHER many &T (shared, read-only) OR exactly one &mut T (exclusive). References can never outlive their data.'),
          c('fn len(s: &String) -> usize { s.len() }\nfn shout(s: &mut String) { s.push(\'!\'); }\n\nlet mut s = String::from("hi");\nprintln!("{}", len(&s));\nshout(&mut s);'),
          t('This rule is what prevents data races at compile time.'),
        ],
        quiz: [
          M('How many &mut references to the same value can be alive at once?', ['0', '1', '2', 'Unlimited'], 1, 'Exclusive access: exactly one mutable reference.'),
          F('Let the function modify the string.', 'fn shout(s: ____ String) {\n    s.push(\'!\');\n}', ['&mut'], '&mut borrows mutably.'),
        ],
      },
      {
        id: 'types', title: 'Structs & Enums', min: 10,
        body: [
          c('struct User { name: String, age: u8 }\n\nimpl User {\n    fn new(name: &str, age: u8) -> Self {\n        Self { name: name.to_string(), age }\n    }\n    fn is_adult(&self) -> bool { self.age >= 18 }\n}\n\nenum Role {\n    Admin,\n    Member { team: String },\n    Guest,\n}\n\nlet score = match role {\n    Role::Admin => 3,\n    Role::Member { .. } => 2,\n    Role::Guest => 1,\n};'),
          t('match must be exhaustive: every variant handled, or the compiler refuses. Enums with data are perfect for modelling API errors and request states.'),
        ],
        quiz: [
          M('What does "exhaustive match" mean?', ['Slow matching', 'Every possible case must be handled', 'Only one arm runs', 'Arms must be sorted'], 1, 'The compiler checks that no variant is forgotten.'),
          F('Add the catch-all arm.', 'match n {\n    1 => "one",\n    ____ => "other",\n}', ['_'], '_ matches anything not matched above.'),
        ],
      },
      {
        id: 'errors', title: 'Option, Result & Errors', min: 10,
        body: [
          t('Rust has no null and no exceptions. Absence is Option<T> (Some/None); failure is Result<T, E> (Ok/Err). The ? operator returns early on Err.'),
          c('fn double(s: &str) -> Result<i32, std::num::ParseIntError> {\n    let n: i32 = s.parse()?;\n    Ok(n * 2)\n}\n\nfn find(id: u32) -> Option<String> {\n    if id == 1 { Some("nour".into()) } else { None }\n}'),
          t('Avoid unwrap() in server code: a panic kills the worker thread. Return errors and map them to HTTP responses (you will do this in Actix).'),
        ],
        quiz: [
          M('What does ? do when the value is Err?', ['Ignores it', 'Panics', 'Returns the error from the current function', 'Retries'], 2, 'It converts and returns the error early.'),
          F('Propagate a parse error.', 'let n: i32 = s.parse()____;', ['?'], '? unwraps Ok or returns Err.'),
        ],
      },
      {
        id: 'iter', title: 'Collections, Iterators & Closures', min: 10,
        body: [
          c('use std::collections::HashMap;\n\nlet mut v = vec![1, 2, 3];\nv.push(4);\nlet doubled: Vec<i32> = v.iter().map(|n| n * 2).collect();\nlet evens = v.iter().filter(|n| **n % 2 == 0).count();\n\nlet mut m = HashMap::new();\nm.insert("a", 1);\nif let Some(x) = m.get("a") { println!("{x}"); }'),
          t('Closures |x| x + 1 capture variables from their scope. Iterator adapters (map, filter) are lazy: nothing runs until a consumer like collect, sum or a for loop pulls values. A move closure takes ownership of what it captures, needed when handing work to threads or async tasks.'),
        ],
        quiz: [
          M('Iterator adapters such as map are...', ['Eager', 'Lazy until consumed', 'Only for Vec', 'Unsafe'], 1, 'They do nothing until something like collect drives them.'),
          F('Gather the results into a Vec.', 'let d: Vec<i32> = v.iter().map(|n| n * 2).____();', ['collect', 'collect()'], 'collect() consumes the iterator into a collection.'),
        ],
      },
      {
        id: 'traits', title: 'Traits & Generics', min: 10,
        body: [
          t('A trait defines shared behaviour. Generics let one function work for any type that implements a trait. Actix and serde are built on this: Responder, FromRequest, Serialize and Deserialize are all traits.'),
          c('trait Speak {\n    fn speak(&self) -> String;\n}\nstruct Dog;\nimpl Speak for Dog {\n    fn speak(&self) -> String { "woof".into() }\n}\nfn talk<T: Speak>(x: &T) { println!("{}", x.speak()); }\n\n#[derive(Debug, Clone, PartialEq)]\nstruct Point { x: i32, y: i32 }'),
          t('#[derive(...)] auto-generates trait implementations.'),
        ],
        quiz: [
          M('What is a trait?', ['A kind of struct', 'A set of methods a type can implement', 'A macro', 'A lifetime'], 1, 'Traits describe shared behaviour, like interfaces.'),
          F('Implement the trait for Dog.', 'trait Speak { fn speak(&self); }\nimpl ____ for Dog {\n    fn speak(&self) {}\n}', ['speak'], 'The syntax is impl TraitName for Type.'),
        ],
      },
      {
        id: 'mods', title: 'Modules, Crates & Lifetimes', min: 8,
        body: [
          c('// main.rs\nmod routes;          // loads routes.rs\nuse routes::health;\n\n// routes.rs\npub fn health() -> &\'static str { "ok" }'),
          t('Items are private unless marked pub. A crate is a package from crates.io, added in Cargo.toml.\n\nLifetimes label how long references live:'),
          c('fn longest<\'a>(a: &\'a str, b: &\'a str) -> &\'a str {\n    if a.len() > b.len() { a } else { b }\n}'),
          t('The compiler infers most lifetimes. In web handlers you will rarely write them: prefer owned data (String) and shared ownership (Arc) in your state.'),
        ],
        quiz: [
          M('Do you annotate a lifetime on every reference?', ['Yes always', 'No, most are inferred', 'Only in main', 'Never allowed'], 1, 'Lifetime elision handles the common cases.'),
          F('Declare a module from routes.rs.', '____ routes;', ['mod'], 'mod declares a module and loads its file.'),
        ],
      },
    ],
  },
  {
    id: 'm2',
    title: 'Async & Concurrency',
    icon: 'flash',
    lessons: [
      {
        id: 'async', title: 'Async/Await & Tokio', min: 9,
        body: [
          t('An async fn returns a Future: a value that does nothing until awaited. A runtime (Tokio) polls many futures on few threads. Actix Web runs on Tokio.'),
          c('async fn fetch() -> u32 { 42 }\n\n#[tokio::main]\nasync fn main() {\n    let n = fetch().await;\n    tokio::time::sleep(std::time::Duration::from_millis(100)).await;\n    println!("{n}");\n}'),
          t('Golden rule: never block a worker thread inside async code. Use tokio::time::sleep, not std::thread::sleep, and move CPU-heavy or blocking work to tokio::task::spawn_blocking.'),
        ],
        quiz: [
          M('Why avoid std::thread::sleep in an async handler?', ['It is deprecated', 'It blocks the worker and stalls other requests', 'It panics', 'It is slower to type'], 1, 'Blocking a runtime thread starves every other task on it.'),
          F('Wait for the future.', 'let n = fetch().____;', ['await'], '.await suspends until the future completes.'),
        ],
      },
      {
        id: 'sync', title: 'Shared State: Arc & Mutex', min: 9,
        body: [
          t('Threads need shared ownership plus safe mutation. Arc is an atomic reference-counted pointer; Mutex and RwLock guard the data. Types marked Send can move between threads; Sync can be shared.'),
          c('use std::sync::{Arc, Mutex};\n\nlet counter = Arc::new(Mutex::new(0));\nlet c2 = Arc::clone(&counter);\n\nstd::thread::spawn(move || {\n    *c2.lock().unwrap() += 1;\n});'),
          t('Keep lock scopes tiny and never hold a std Mutex guard across an .await. For simple counters prefer atomics (AtomicU64).'),
        ],
        quiz: [
          M('What does Arc::clone(&a) do?', ['Deep copies the data', 'Increments a reference count', 'Locks the data', 'Moves the data'], 1, 'Only the pointer count changes; data is shared.'),
          F('Create a second handle.', 'let c2 = Arc::____(&counter);', ['clone'], 'Arc::clone is cheap and shares the same allocation.'),
        ],
      },
    ],
  },
  {
    id: 'm3',
    title: 'Actix Web Core',
    icon: 'server',
    lessons: [
      {
        id: 'hello', title: 'Your First Actix Server', min: 9,
        body: [
          t('Add to Cargo.toml: actix-web = "4", serde = { version = "1", features = ["derive"] }.'),
          c('use actix_web::{get, App, HttpServer, Responder};\n\n#[get("/health")]\nasync fn health() -> impl Responder {\n    "ok"\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    HttpServer::new(|| App::new().service(health))\n        .bind(("127.0.0.1", 8080))?\n        .run()\n        .await\n}'),
          t('HttpServer starts one worker per CPU core by default, and each worker builds its own App by calling your closure. So the closure runs once per worker.'),
        ],
        quiz: [
          M('How many times does the closure given to HttpServer::new run?', ['Once', 'Once per request', 'Once per worker thread', 'Never'], 2, 'Every worker builds its own App instance.'),
          F('Register a GET route.', '#[____("/health")]\nasync fn health() -> impl Responder { "ok" }', ['get'], '#[get("/path")] attaches a GET route to the handler.'),
        ],
      },
      {
        id: 'routing', title: 'Routing & Extractors', min: 11,
        body: [
          t('Extractors parse the request before your handler runs: Path, Query, Json, Data, HttpRequest. If parsing fails, Actix answers 400 for you.'),
          c('use actix_web::{web, HttpResponse};\nuse serde::{Deserialize, Serialize};\n\n#[derive(Deserialize, Serialize)]\nstruct NewUser { name: String }\n#[derive(Deserialize)]\nstruct Page { page: u32 }\n\nasync fn get_user(id: web::Path<u32>) -> HttpResponse {\n    HttpResponse::Ok().body(format!("user {}", id.into_inner()))\n}\nasync fn list(q: web::Query<Page>) -> HttpResponse {\n    HttpResponse::Ok().body(format!("page {}", q.page))\n}\nasync fn create(body: web::Json<NewUser>) -> HttpResponse {\n    HttpResponse::Created().json(body.into_inner())\n}\n\nApp::new().service(\n    web::scope("/api/v1")\n        .route("/users", web::get().to(list))\n        .route("/users", web::post().to(create))\n        .route("/users/{id}", web::get().to(get_user)),\n)'),
        ],
        quiz: [
          M('Which extractor reads the {id} in /users/{id}?', ['web::Query', 'web::Json', 'web::Path', 'web::Data'], 2, 'Path pulls typed values out of the URL pattern.'),
          F('Read a JSON body.', 'async fn create(body: web::____<NewUser>) -> HttpResponse { todo!() }', ['json', 'Json'], 'web::Json<T> deserializes the body with serde.'),
        ],
      },
      {
        id: 'state', title: 'App State & Shared Data', min: 9,
        body: [
          c('use actix_web::{web, App, HttpServer};\nuse std::sync::atomic::{AtomicU64, Ordering};\n\nstruct AppState { hits: AtomicU64 }\n\nasync fn count(s: web::Data<AppState>) -> String {\n    let n = s.hits.fetch_add(1, Ordering::Relaxed) + 1;\n    format!("hits: {n}")\n}\n\n#[actix_web::main]\nasync fn main() -> std::io::Result<()> {\n    let state = web::Data::new(AppState { hits: AtomicU64::new(0) });\n    HttpServer::new(move || {\n        App::new()\n            .app_data(state.clone())\n            .route("/", web::get().to(count))\n    })\n    .bind(("127.0.0.1", 8080))?\n    .run()\n    .await\n}'),
          t('Create web::Data OUTSIDE the closure and clone it inside. If you build it inside, every worker gets its own separate copy and counters, caches and limiters will not be shared. web::Data is an Arc under the hood.'),
        ],
        quiz: [
          M('Where do you create state that all workers must share?', ['Inside the closure', 'Outside the closure, then clone into it', 'In each handler', 'In a macro'], 1, 'Creating it inside gives each worker a separate copy.'),
          F('Attach the state to the app.', 'App::new().____(state.clone())', ['app_data'], 'app_data registers shared data.'),
        ],
      },
      {
        id: 'errs', title: 'Errors & Responses', min: 10,
        body: [
          t('Handlers can return Result<T, E> where E implements ResponseError. That lets you use ? and map errors to status codes in one place.'),
          c('use actix_web::{http::StatusCode, HttpResponse, ResponseError};\nuse std::fmt;\n\n#[derive(Debug)]\nenum ApiError { NotFound, Internal }\n\nimpl fmt::Display for ApiError {\n    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {\n        write!(f, "{:?}", self)\n    }\n}\n\nimpl ResponseError for ApiError {\n    fn status_code(&self) -> StatusCode {\n        match self {\n            ApiError::NotFound => StatusCode::NOT_FOUND,\n            ApiError::Internal => StatusCode::INTERNAL_SERVER_ERROR,\n        }\n    }\n}\n\nasync fn item() -> Result<HttpResponse, ApiError> {\n    Err(ApiError::NotFound)\n}'),
          t('Security tip: log the detailed error on the server, but return a generic message to the client. Never leak internals.'),
        ],
        quiz: [
          M('Which trait turns your error type into an HTTP response?', ['Responder', 'ResponseError', 'FromRequest', 'Display only'], 1, 'ResponseError defines status code and body for an error.'),
          F('Implement it.', 'impl ____ for ApiError {\n    fn status_code(&self) -> StatusCode { StatusCode::NOT_FOUND }\n}', ['responseerror', 'ResponseError'], 'Implement ResponseError to make the type usable as a handler error.'),
        ],
      },
      {
        id: 'mw', title: 'Middleware & Logging', min: 8,
        body: [
          t('Middleware wraps every request: logging, compression, auth, CORS, rate limiting. Built in: Logger, Compress, NormalizePath, DefaultHeaders.'),
          c('use actix_web::{middleware, App};\n\n// main: env_logger::init();  run with RUST_LOG=info\nApp::new()\n    .wrap(middleware::Logger::default())\n    .wrap(middleware::Compress::default())'),
          t('Order matters: the LAST .wrap() is the outermost layer and sees the request first (and the response last).'),
        ],
        quiz: [
          M('With .wrap(A).wrap(B), who sees the request first?', ['A', 'B', 'Both at once', 'Neither'], 1, 'The last wrap is the outermost layer.'),
          F('Add the logger.', 'App::new().____(middleware::Logger::default())', ['wrap'], '.wrap() attaches middleware.'),
        ],
      },
      {
        id: 'crud', title: 'Building a REST CRUD API', min: 14,
        body: [
          t('A resource API maps verbs to actions. Use proper status codes: 200 read, 201 created, 204 deleted, 400 bad input, 404 missing, 409 conflict, 422 invalid. Version your paths (/api/v1).'),
          c('use std::{collections::HashMap, sync::{Mutex, atomic::{AtomicU32, Ordering}}};\n\n#[derive(Clone, Serialize)]\nstruct Item { id: u32, name: String }\n#[derive(Deserialize)]\nstruct NewItem { name: String }\n\nstruct Store { items: Mutex<HashMap<u32, Item>>, next: AtomicU32 }\n\nasync fn create(st: web::Data<Store>, body: web::Json<NewItem>) -> HttpResponse {\n    let id = st.next.fetch_add(1, Ordering::SeqCst);\n    let item = Item { id, name: body.name.clone() };\n    st.items.lock().unwrap().insert(id, item.clone());\n    HttpResponse::Created().json(item)\n}\n\nasync fn get_one(st: web::Data<Store>, id: web::Path<u32>) -> HttpResponse {\n    match st.items.lock().unwrap().get(&id.into_inner()) {\n        Some(i) => HttpResponse::Ok().json(i),\n        None => HttpResponse::NotFound().finish(),\n    }\n}\n\nweb::scope("/items")\n    .route("", web::get().to(list))\n    .route("", web::post().to(create))\n    .route("/{id}", web::get().to(get_one))\n    .route("/{id}", web::put().to(update))\n    .route("/{id}", web::delete().to(remove))'),
          t('Challenge: write list, update and remove yourself. Later swap the HashMap for a database pool (sqlx).'),
        ],
        quiz: [
          M('Best status code after successfully creating a resource?', ['200', '201', '204', '302'], 1, '201 Created.'),
          F('Return 201.', 'HttpResponse::____().json(item)', ['created', 'Created'], 'HttpResponse::Created() builds a 201 response.'),
        ],
      },
      {
        id: 'valid', title: 'Validation & Serde', min: 9,
        body: [
          t('Never trust input. Validate lengths, ranges and allowed values, reject unknown fields, and cap the body size so nobody can exhaust your memory.'),
          c('#[derive(Deserialize)]\n#[serde(deny_unknown_fields)]\nstruct NewItem {\n    name: String,\n    #[serde(default)]\n    qty: u32,\n}\n\nfn validate(i: &NewItem) -> Result<(), &\'static str> {\n    if i.name.trim().is_empty() || i.name.len() > 80 { return Err("bad name"); }\n    if i.qty > 1000 { return Err("bad qty"); }\n    Ok(())\n}\n\nApp::new().app_data(web::JsonConfig::default().limit(4096))'),
          t('Return 400 or 422 with a short message when validation fails.'),
        ],
        quiz: [
          M('Why cap the JSON body size?', ['Prettier logs', 'Prevent memory exhaustion from huge payloads', 'Faster compile', 'Required by HTTP'], 1, 'Unbounded bodies are an easy denial-of-service vector.'),
          F('Limit body to 4096 bytes.', 'web::JsonConfig::default().____(4096)', ['limit'], 'JsonConfig::limit sets the maximum payload size.'),
        ],
      },
    ],
  },
  {
    id: 'm4',
    title: 'Production: Security, Speed, Resources',
    icon: 'shield-checkmark',
    lessons: [
      {
        id: 'sec', title: 'Security Essentials', min: 12,
        body: [
          t('Checklist for a real API:\n• TLS: rustls in Actix, or terminate at nginx/Caddy\n• Passwords: hash with argon2 (salted), never store plain text or plain SHA\n• Auth: JWT (jsonwebtoken crate) or sessions, checked in middleware or a custom extractor\n• CORS: explicit origins only, never permissive() in production\n• Headers: X-Content-Type-Options: nosniff, Strict-Transport-Security via DefaultHeaders\n• SQL: parameterised queries (sqlx), never string-built SQL\n• Secrets: environment variables, never in git or logs'),
          c('use actix_cors::Cors;\nuse actix_web::middleware::DefaultHeaders;\n\nlet cors = Cors::default()\n    .allowed_origin("https://app.example.com")\n    .allowed_methods(vec!["GET", "POST"])\n    .max_age(3600);\n\nApp::new()\n    .wrap(cors)\n    .wrap(DefaultHeaders::new().add(("X-Content-Type-Options", "nosniff")))'),
        ],
        quiz: [
          M('How should passwords be stored?', ['Plain text', 'Base64', 'Salted argon2 hash', 'MD5'], 2, 'Use a slow, salted, memory-hard hash such as argon2.'),
          F('Allow only your frontend.', 'let cors = Cors::default().____("https://app.example.com");', ['allowed_origin'], 'allowed_origin whitelists a single origin.'),
        ],
      },
      {
        id: 'rate', title: 'Rate Limiting', min: 10,
        body: [
          t('Rate limiting stops abuse and brute force. The actix-governor crate applies a per-client limit (GCRA algorithm): a steady refill rate plus a burst size. Exceeding it returns 429 Too Many Requests.'),
          c('use actix_governor::{Governor, GovernorConfigBuilder};\n\nlet conf = GovernorConfigBuilder::default()\n    .seconds_per_request(1)\n    .burst_size(5)\n    .finish()\n    .unwrap();\n\nHttpServer::new(move || {\n    App::new().wrap(Governor::new(&conf))\n})'),
          t('Notes:\n• build the config outside the closure so the limiter is shared\n• behind a proxy, key on X-Forwarded-For only if the proxy is yours\n• use stricter limits on /login and other sensitive routes\n• check the crate docs for the API of the version you install'),
        ],
        quiz: [
          M('Which status means "you are rate limited"?', ['401', '403', '429', '503'], 2, '429 Too Many Requests, optionally with a Retry-After header.'),
          F('Allow bursts of 5.', 'GovernorConfigBuilder::default().____(5)', ['burst_size'], 'burst_size is how many requests can arrive at once.'),
        ],
      },
      {
        id: 'cache', title: 'Caching', min: 10,
        body: [
          t('Three layers:\n• HTTP: Cache-Control and ETag (clients answer 304 Not Modified)\n• In-process: the moka crate, concurrent with TTL and max size\n• External: Redis when you run several instances\nAlways bound the size, set a TTL, and invalidate on writes.'),
          c('use moka::future::Cache;\nuse std::time::Duration;\n\nlet cache: Cache<u32, String> = Cache::builder()\n    .max_capacity(10_000)\n    .time_to_live(Duration::from_secs(60))\n    .build();\n\ncache.insert(1, "cached".to_string()).await;\nlet hit = cache.get(&1).await;\n\nHttpResponse::Ok()\n    .insert_header(("Cache-Control", "public, max-age=60"))\n    .json(data)'),
        ],
        quiz: [
          M('Why set max_capacity on an in-memory cache?', ['Speed only', 'Prevent unbounded memory growth', 'Required by Rust', 'Encrypts entries'], 1, 'An unbounded cache is a memory leak waiting to happen.'),
          F('Set the HTTP caching header.', 'HttpResponse::Ok().insert_header(("____", "public, max-age=60"))', ['cache-control', 'Cache-Control'], 'Cache-Control tells clients and proxies how long to reuse the response.'),
        ],
      },
      {
        id: 'mem', title: 'Memory & Resource Management', min: 14,
        body: [
          t('Rust has no GC, so memory problems come from unbounded growth (caches, queues, bodies), not forgotten frees. Bound everything:\n• request bodies and uploads (JsonConfig, PayloadConfig)\n• cache size and TTL, channel capacity\n• workers, max_connections, backlog\n• slow clients: client_request_timeout and keep_alive\n• DB pool: max size and acquire timeout\n• big files: stream (web::Payload, HttpResponse::streaming) instead of loading whole\n• CPU or blocking work: spawn_blocking\n• graceful shutdown so in-flight requests finish on SIGTERM'),
          c('use std::time::Duration;\n\nHttpServer::new(move || App::new().app_data(state.clone()).service(health))\n    .workers(4)\n    .max_connections(10_000)\n    .client_request_timeout(Duration::from_secs(5))\n    .keep_alive(Duration::from_secs(30))\n    .shutdown_timeout(30)\n    .bind(("0.0.0.0", 8080))?\n    .run()\n    .await'),
          t('Measure, do not guess: build with --release, then use tracing logs, tokio-console, cargo flamegraph or heaptrack.'),
        ],
        quiz: [
          M('Main cause of memory growth in a Rust server?', ['Forgotten free()', 'Unbounded collections, caches or queues', 'The borrow checker', 'println!'], 1, 'Ownership frees memory; you must bound what you keep.'),
          F('Give in-flight requests 30 seconds on shutdown.', 'HttpServer::new(app).____(30)', ['shutdown_timeout'], 'shutdown_timeout controls graceful shutdown time.'),
        ],
      },
      {
        id: 'ship', title: 'Testing & Shipping', min: 10,
        body: [
          c('use actix_web::{test, App};\n\n#[actix_web::test]\nasync fn health_ok() {\n    let app = test::init_service(App::new().service(health)).await;\n    let req = test::TestRequest::get().uri("/health").to_request();\n    let resp = test::call_service(&app, req).await;\n    assert!(resp.status().is_success());\n}'),
          t('Ship it:\n• cargo build --release, run clippy and fmt in CI\n• multi-stage Dockerfile, small final image\n• configuration from environment variables\n• structured logs (tracing), a /health endpoint\n• reverse proxy (Caddy or nginx) for TLS and extra limits'),
          h('Final challenge'),
          t('Build a Notes API from scratch: CRUD routes, validated JSON, JWT auth, argon2 passwords, rate limiting on /login, a moka cache for reads, body limits, timeouts and graceful shutdown, plus tests. When you can do that without copying, you have finished the cave.'),
        ],
        quiz: [
          M('Which attribute runs an async Actix test?', ['#[test]', '#[actix_web::test]', '#[async_test]', '#[tokio::main]'], 1, 'It sets up the Actix runtime for the test.'),
          F('Send the request to the app.', 'let resp = test::____(&app, req).await;', ['call_service'], 'call_service runs one request through the service.'),
        ],
      },
    ],
  },
];
