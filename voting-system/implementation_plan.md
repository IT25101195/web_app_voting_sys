# Six-Module Reality Show Voting System — Implementation Plan

A full-stack Spring Boot REST API implementing six core modules for a web-based voting system for reality shows: Reality Show Management, Contestant Management, Voting & Voting Session Management, Voting Compliance & Security, Judge & Panel Management, and Customer Support & Complaint Management.

---

## UML Class Diagrams

### Complete Entity Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ USER_ROLE : has
    ROLE ||--o{ USER_ROLE : "assigned to"
    ROLE ||--o{ ROLE_PERMISSION : has
    USER ||--o{ VOTE : casts
    USER ||--o{ SUPPORT_TICKET : submits
    USER ||--o{ FEEDBACK : gives
    REALITY_SHOW ||--o{ SEASON : has
    SEASON ||--o{ EPISODE : contains
    EPISODE ||--o{ VOTING_SESSION : schedules
    REALITY_SHOW ||--o{ CONTESTANT : features
    SEASON ||--o{ CONTESTANT : "competes in"
    VOTING_SESSION ||--o{ VOTE : receives
    CONTESTANT ||--o{ VOTE : "voted for"
    EPISODE ||--o{ JUDGING_PANEL : "evaluated by"
    JUDGING_PANEL ||--o{ PANEL_ASSIGNMENT : includes
    JUDGE ||--o{ PANEL_ASSIGNMENT : "assigned via"
    JUDGE ||--o{ SCORE : submits
    CONTESTANT ||--o{ SCORE : "scored on"
    EPISODE ||--o{ SCORE : "scored in"
    SUPPORT_TICKET ||--o{ TICKET_RESPONSE : has
    FEEDBACK }o--|| REALITY_SHOW : "about"
    AUDIT_LOG }o--o| USER : "performed by"

    USER {
        Long id PK
        String username
        String email
        String password
        Boolean enabled
        LocalDateTime createdAt
        LocalDateTime updatedAt
    }

    USER_ROLE {
        Long id PK
        Long userId FK
        Long roleId FK
    }

    REALITY_SHOW {
        Long id PK
        String title
        String description
        String genre
        ShowStatus status
        LocalDateTime createdAt
        LocalDateTime updatedAt
    }

    SEASON {
        Long id PK
        Long showId FK
        Integer seasonNumber
        LocalDate startDate
        LocalDate endDate
    }

    EPISODE {
        Long id PK
        Long seasonId FK
        Integer episodeNumber
        String title
        LocalDate airDate
    }

    VOTING_SESSION {
        Long id PK
        Long episodeId FK
        SessionStatus status
        LocalDateTime startTime
        LocalDateTime endTime
        Integer maxVotesPerUser
    }

    CONTESTANT {
        Long id PK
        Long showId FK
        Long seasonId FK
        String name
        String biography
        String photoPath
        ContestantStatus status
    }

    VOTE {
        Long id PK
        Long sessionId FK
        Long contestantId FK
        Long userId
        String ipAddress
        LocalDateTime castAt
    }

    JUDGE {
        Long id PK
        String name
        String biography
        String expertise
        Boolean active
    }

    JUDGING_PANEL {
        Long id PK
        Long episodeId FK
        String panelName
    }

    PANEL_ASSIGNMENT {
        Long id PK
        Long panelId FK
        Long judgeId FK
    }

    SCORE {
        Long id PK
        Long judgeId FK
        Long contestantId FK
        Long episodeId FK
        Double score
        String comment
        LocalDateTime submittedAt
    }

    SUPPORT_TICKET {
        Long id PK
        Long userId FK
        String category
        String subject
        String description
        TicketStatus status
        LocalDateTime createdAt
    }

    TICKET_RESPONSE {
        Long id PK
        Long ticketId FK
        Long responderId
        String message
        LocalDateTime createdAt
    }

    FEEDBACK {
        Long id PK
        Long userId FK
        Long showId FK
        Integer rating
        String comment
        LocalDateTime createdAt
    }

    FAQ {
        Long id PK
        String question
        String answer
        Integer displayOrder
        Boolean published
    }

    AUDIT_LOG {
        Long id PK
        String actor
        String action
        String entityType
        Long entityId
        String details
        LocalDateTime timestamp
    }

    ROLE {
        Long id PK
        String name
    }

    ROLE_PERMISSION {
        Long id PK
        Long roleId FK
        String permission
    }
```

---

### Module 6.0 — Security & Authentication (Class Diagram)

```mermaid
classDiagram
    direction TB

    class User {
        -Long id
        -String username
        -String email
        -String password
        -Boolean enabled
        -Set~Role~ roles
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +getters/setters()
    }

    class Role {
        -Long id
        -String name
        -Set~String~ permissions
        +getters/setters()
    }

    class RefreshToken {
        -Long id
        -User user
        -String token
        -LocalDateTime expiryDate
        +isExpired() boolean
    }

    class UserRepository {
        <<interface>>
        +findByUsername(String) Optional~User~
        +findByEmail(String) Optional~User~
        +existsByUsername(String) boolean
        +existsByEmail(String) boolean
    }

    class RoleRepository {
        <<interface>>
        +findByName(String) Optional~Role~
        +findAll() List~Role~
    }

    class RefreshTokenRepository {
        <<interface>>
        +findByToken(String) Optional~RefreshToken~
        +deleteByUserId(Long) void
    }

    class AuthService {
        -UserRepository userRepo
        -RoleRepository roleRepo
        -PasswordEncoder encoder
        -JwtUtils jwtUtils
        +register(RegisterDTO) User
        +login(LoginDTO) JwtResponseDTO
        +refreshToken(String) JwtResponseDTO
        +logout(Long userId) void
    }

    class UserService {
        -UserRepository userRepo
        -RoleRepository roleRepo
        +createUser(UserDTO) User
        +getUser(Long) User
        +listUsers(Pageable) Page~User~
        +updateUser(Long, UserDTO) User
        +deleteUser(Long) void
        +changePassword(Long, PasswordDTO) void
        +toggleEnabled(Long) User
        +assignRole(Long userId, Long roleId) User
        +removeRole(Long userId, Long roleId) User
    }

    class RoleService {
        -RoleRepository roleRepo
        +createRole(RoleDTO) Role
        +getRole(Long) Role
        +listRoles() List~Role~
        +updateRole(Long, RoleDTO) Role
        +deleteRole(Long) void
        +updatePermissions(Long, Set~String~) Role
    }

    class JwtUtils {
        -String jwtSecret
        -Long jwtExpirationMs
        +generateToken(UserDetails) String
        +validateToken(String) boolean
        +getUsernameFromToken(String) String
    }

    class JwtAuthenticationFilter {
        -JwtUtils jwtUtils
        -UserDetailsService userDetailsService
        +doFilterInternal(request, response, chain) void
    }

    class SecurityConfig {
        -JwtAuthenticationFilter jwtFilter
        +securityFilterChain(HttpSecurity) SecurityFilterChain
        +passwordEncoder() PasswordEncoder
        +authenticationManager() AuthenticationManager
    }

    class AuthController {
        -AuthService authService
        +register(RegisterDTO) ResponseEntity
        +login(LoginDTO) ResponseEntity
        +refreshToken(TokenRefreshDTO) ResponseEntity
        +logout(JwtPrincipal) ResponseEntity
    }

    class AdminUserController {
        -UserService userService
        +createUser(UserDTO) ResponseEntity
        +getUser(Long) ResponseEntity
        +listUsers(Pageable) ResponseEntity
        +updateUser(Long, UserDTO) ResponseEntity
        +deleteUser(Long) ResponseEntity
        +toggleEnabled(Long) ResponseEntity
        +assignRole(Long, RoleDTO) ResponseEntity
        +removeRole(Long, Long) ResponseEntity
    }

    class AdminRoleController {
        -RoleService roleService
        +createRole(RoleDTO) ResponseEntity
        +getRole(Long) ResponseEntity
        +listRoles() ResponseEntity
        +updateRole(Long, RoleDTO) ResponseEntity
        +deleteRole(Long) ResponseEntity
        +updatePermissions(Long, PermissionDTO) ResponseEntity
    }

    User "*" --> "*" Role : many-to-many
    User "1" --> "*" RefreshToken

    UserRepository ..> User
    RoleRepository ..> Role
    RefreshTokenRepository ..> RefreshToken

    AuthService --> UserRepository
    AuthService --> RoleRepository
    AuthService --> JwtUtils
    UserService --> UserRepository
    UserService --> RoleRepository
    RoleService --> RoleRepository

    JwtAuthenticationFilter --> JwtUtils
    SecurityConfig --> JwtAuthenticationFilter

    AuthController --> AuthService
    AdminUserController --> UserService
    AdminRoleController --> RoleService
```

---

### Module 6.1 — Reality Show Management (Class Diagram)

```mermaid
classDiagram
    direction TB

    class RealityShow {
        -Long id
        -String title
        -String description
        -String genre
        -ShowStatus status
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +getters/setters()
    }

    class Season {
        -Long id
        -RealityShow show
        -Integer seasonNumber
        -LocalDate startDate
        -LocalDate endDate
        +getters/setters()
    }

    class Episode {
        -Long id
        -Season season
        -Integer episodeNumber
        -String title
        -LocalDate airDate
        +getters/setters()
    }

    class VotingSession {
        -Long id
        -Episode episode
        -SessionStatus status
        -LocalDateTime startTime
        -LocalDateTime endTime
        -Integer maxVotesPerUser
        +getters/setters()
    }

    class ShowStatus {
        <<enumeration>>
        DRAFT
        ACTIVE
        COMPLETED
        ARCHIVED
    }

    class SessionStatus {
        <<enumeration>>
        SCHEDULED
        OPEN
        CLOSED
    }

    class RealityShowRepository {
        <<interface>>
        +findByStatus(ShowStatus) List~RealityShow~
        +findByTitleContaining(String) List~RealityShow~
    }

    class SeasonRepository {
        <<interface>>
        +findByShowId(Long) List~Season~
    }

    class EpisodeRepository {
        <<interface>>
        +findBySeasonId(Long) List~Episode~
    }

    class VotingSessionRepository {
        <<interface>>
        +findByEpisodeId(Long) List~VotingSession~
        +findByStatus(SessionStatus) List~VotingSession~
    }

    class RealityShowService {
        -RealityShowRepository showRepo
        +createShow(ShowDTO) RealityShow
        +updateShow(Long, ShowDTO) RealityShow
        +deleteShow(Long) void
        +archiveShow(Long) RealityShow
    }

    class SeasonService {
        -SeasonRepository seasonRepo
        +createOrUpdate(Long, SeasonDTO) Season
        +delete(Long) void
    }

    class EpisodeService {
        -EpisodeRepository episodeRepo
        +createOrUpdate(Long, EpisodeDTO) Episode
        +delete(Long) void
    }

    class VotingSessionService {
        -VotingSessionRepository sessionRepo
        +scheduleSession(Long, SessionDTO) VotingSession
        +openSession(Long) VotingSession
        +closeSession(Long) VotingSession
    }

    class AdminShowController {
        -RealityShowService showService
        -ContestantService contestantService
        +createShow(ShowDTO) ResponseEntity
        +updateShow(Long, ShowDTO) ResponseEntity
        +deleteShow(Long) ResponseEntity
        +archiveShow(Long) ResponseEntity
        +assignContestants(Long, AssignDTO) ResponseEntity
    }

    class AdminSeasonController {
        -SeasonService seasonService
        +manageSeason(Long, SeasonDTO) ResponseEntity
        +deleteSeason(Long) ResponseEntity
    }

    class AdminEpisodeController {
        -EpisodeService episodeService
        +manageEpisode(Long, EpisodeDTO) ResponseEntity
        +deleteEpisode(Long) ResponseEntity
    }

    class AdminVotingSessionController {
        -VotingSessionService sessionService
        +scheduleSession(Long, SessionDTO) ResponseEntity
        +openSession(Long) ResponseEntity
        +closeSession(Long) ResponseEntity
    }

    RealityShow --> ShowStatus
    VotingSession --> SessionStatus
    RealityShow "1" --> "*" Season
    Season "1" --> "*" Episode
    Episode "1" --> "*" VotingSession

    RealityShowRepository ..> RealityShow
    SeasonRepository ..> Season
    EpisodeRepository ..> Episode
    VotingSessionRepository ..> VotingSession

    RealityShowService --> RealityShowRepository
    SeasonService --> SeasonRepository
    EpisodeService --> EpisodeRepository
    VotingSessionService --> VotingSessionRepository

    AdminShowController --> RealityShowService
    AdminSeasonController --> SeasonService
    AdminEpisodeController --> EpisodeService
    AdminVotingSessionController --> VotingSessionService
```

---

### Module 6.2 — Contestant Management (Class Diagram)

```mermaid
classDiagram
    direction TB

    class Contestant {
        -Long id
        -RealityShow show
        -Season season
        -String name
        -String biography
        -String photoPath
        -ContestantStatus status
        +getters/setters()
    }

    class ContestantStatus {
        <<enumeration>>
        ACTIVE
        ELIMINATED
        WINNER
        REMOVED
    }

    class ContestantRepository {
        <<interface>>
        +findByShowId(Long) List~Contestant~
        +findByShowIdAndSeasonId(Long, Long) List~Contestant~
        +findByStatus(ContestantStatus) List~Contestant~
    }

    class ContestantService {
        -ContestantRepository contestantRepo
        -FileStorageService fileStorageService
        +addContestant(ContestantDTO) Contestant
        +getContestant(Long) Contestant
        +updateContestant(Long, ContestantDTO) Contestant
        +deactivateContestant(Long) void
        +uploadPhoto(Long, MultipartFile) Contestant
        +updateStatus(Long, ContestantStatus) Contestant
        +assignToShow(Long, AssignDTO) Contestant
    }

    class FileStorageService {
        -String uploadDir
        +store(MultipartFile) String
        +load(String) Resource
        +delete(String) void
    }

    class AdminContestantController {
        -ContestantService contestantService
        +addContestant(ContestantDTO) ResponseEntity
        +getContestant(Long) ResponseEntity
        +updateContestant(Long, ContestantDTO) ResponseEntity
        +deactivateContestant(Long) ResponseEntity
        +uploadPhoto(Long, MultipartFile) ResponseEntity
        +updateStatus(Long, StatusDTO) ResponseEntity
        +assignToShow(Long, AssignDTO) ResponseEntity
    }

    Contestant --> ContestantStatus
    ContestantRepository ..> Contestant
    ContestantService --> ContestantRepository
    ContestantService --> FileStorageService
    AdminContestantController --> ContestantService
```

---

### Module 6.3 — Voting & Voting Session Management (Class Diagram)

```mermaid
classDiagram
    direction TB

    class VotingSession {
        -Long id
        -Episode episode
        -SessionStatus status
        -LocalDateTime startTime
        -LocalDateTime endTime
        -Integer maxVotesPerUser
        +getters/setters()
    }

    class Vote {
        -Long id
        -VotingSession session
        -Contestant contestant
        -Long userId
        -String ipAddress
        -LocalDateTime castAt
        +getters/setters()
    }

    class VotingSessionService {
        -VotingSessionRepository sessionRepo
        +createSession(SessionDTO) VotingSession
        +listSessions() List~VotingSession~
        +updateSession(Long, SessionDTO) VotingSession
        +deleteSession(Long) void
        +openSession(Long) VotingSession
        +closeSession(Long) VotingSession
    }

    class VoteService {
        -VoteRepository voteRepo
        -VotingSessionRepository sessionRepo
        +castVote(VoteDTO, Long userId) Vote
        +validate(VoteDTO, Long userId) void
        +getConfirmation(Long) VoteConfirmationDTO
    }

    class VotingSessionRepository {
        <<interface>>
        +findByEpisodeId(Long) List~VotingSession~
        +findByStatus(SessionStatus) List~VotingSession~
    }

    class VoteRepository {
        <<interface>>
        +findBySessionIdAndUserId(Long, Long) List~Vote~
        +countBySessionIdAndUserId(Long, Long) Long
        +countBySessionIdAndContestantId(Long, Long) Long
        +findBySessionId(Long) List~Vote~
    }

    class AdminVotingSessionController {
        -VotingSessionService sessionService
        +createSession(SessionDTO) ResponseEntity
        +listSessions() ResponseEntity
        +updateSession(Long, SessionDTO) ResponseEntity
        +deleteSession(Long) ResponseEntity
        +openSession(Long) ResponseEntity
        +closeSession(Long) ResponseEntity
    }

    class VoteController {
        -VoteService voteService
        +castVote(VoteDTO, JwtPrincipal) ResponseEntity
        +getConfirmation(Long) ResponseEntity
    }

    VotingSession "1" --> "*" Vote
    VotingSessionRepository ..> VotingSession
    VoteRepository ..> Vote
    VotingSessionService --> VotingSessionRepository
    VoteService --> VoteRepository
    VoteService --> VotingSessionRepository
    AdminVotingSessionController --> VotingSessionService
    VoteController --> VoteService
```

---

### Module 6.4 — Voting Compliance & Security (Class Diagram)

> [!NOTE]
> The `Role` and `User` entities are **defined in Module 6.0** (Security & Authentication). This module **reuses** them and adds compliance-specific operations. The `AdminRoleController` from Module 6.0 already provides full Role CRUD — this module's `AdminComplianceController` focuses on voting-specific monitoring and reporting.

```mermaid
classDiagram
    direction TB

    class AuditLog {
        -Long id
        -String actor
        -String action
        -String entityType
        -Long entityId
        -String details
        -String ipAddress
        -LocalDateTime timestamp
        +getters/setters()
    }

    class AuditLogRepository {
        <<interface>>
        +findById(Long) Optional~AuditLog~
        +findAll(Pageable) Page~AuditLog~
        +findByActorAndTimestampBetween(String, LocalDateTime, LocalDateTime) List~AuditLog~
        +findByEntityTypeAndEntityId(String, Long) List~AuditLog~
        +findByAction(String) List~AuditLog~
        +findByTimestampBefore(LocalDateTime) List~AuditLog~
        +countByEntityTypeAndTimestampBetween(String, LocalDateTime, LocalDateTime) Long
    }

    class ComplianceService {
        -VoteRepository voteRepo
        -AuditLogRepository auditLogRepo
        +getActivity(Long sessionId) VotingActivityDTO
        +detectAnomalies(Long sessionId) List~AnomalyDTO~
        +verifyIntegrity(Long sessionId) IntegrityReportDTO
        +generateReport(Long sessionId) ComplianceReportDTO
    }

    class AuditLogService {
        -AuditLogRepository auditLogRepo
        +log(String actor, String action, String entity, Long entityId, String details) AuditLog
        +getById(Long) AuditLog
        +search(AuditSearchCriteria, Pageable) Page~AuditLog~
        +getByEntity(String entityType, Long entityId) List~AuditLog~
        +purge(LocalDateTime before) Long
        +export(AuditSearchCriteria) byte[]
    }

    class AdminComplianceController {
        -ComplianceService complianceService
        +getActivity(Long sessionId) ResponseEntity
        +detectAnomalies(Long sessionId) ResponseEntity
        +verifyIntegrity(Long sessionId) ResponseEntity
        +generateReport(Long sessionId) ResponseEntity
    }

    class AdminAuditLogController {
        -AuditLogService auditLogService
        +listLogs(Pageable, filters) ResponseEntity
        +getLogById(Long) ResponseEntity
        +getLogsByEntity(String, Long) ResponseEntity
        +purgeLogs(LocalDateTime) ResponseEntity
        +exportLogs(AuditSearchCriteria) ResponseEntity
    }

    class AuditLoggingAspect {
        -AuditLogService auditLogService
        +logAdminAction(JoinPoint) void
        +logVotingAction(JoinPoint) void
        +logAuthAction(JoinPoint) void
    }

    AuditLogRepository ..> AuditLog
    ComplianceService --> VoteRepository
    ComplianceService --> AuditLogRepository
    AuditLogService --> AuditLogRepository
    AdminComplianceController --> ComplianceService
    AdminAuditLogController --> AuditLogService
    AuditLoggingAspect --> AuditLogService
```

---

### Module 6.5 — Judge & Panel Management (Class Diagram)

```mermaid
classDiagram
    direction TB

    class Judge {
        -Long id
        -String name
        -String biography
        -String expertise
        -Boolean active
        +getters/setters()
    }

    class JudgingPanel {
        -Long id
        -Episode episode
        -String panelName
        -List~PanelAssignment~ assignments
        +getters/setters()
    }

    class PanelAssignment {
        -Long id
        -JudgingPanel panel
        -Judge judge
        +getters/setters()
    }

    class Score {
        -Long id
        -Judge judge
        -Contestant contestant
        -Episode episode
        -Double score
        -String comment
        -LocalDateTime submittedAt
        +getters/setters()
    }

    class JudgeRepository {
        <<interface>>
        +findByActive(Boolean) List~Judge~
    }

    class JudgingPanelRepository {
        <<interface>>
        +findByEpisodeId(Long) List~JudgingPanel~
    }

    class PanelAssignmentRepository {
        <<interface>>
        +findByJudgeId(Long) List~PanelAssignment~
        +findByPanelId(Long) List~PanelAssignment~
        +existsByPanelIdAndJudgeId(Long, Long) boolean
    }

    class ScoreRepository {
        <<interface>>
        +findByJudgeIdAndEpisodeId(Long, Long) List~Score~
        +findByEpisodeId(Long) List~Score~
        +findByContestantIdAndEpisodeId(Long, Long) List~Score~
    }

    class JudgeService {
        -JudgeRepository judgeRepo
        +addJudge(JudgeDTO) Judge
        +getJudge(Long) Judge
        +updateJudge(Long, JudgeDTO) Judge
        +deactivateJudge(Long) Judge
    }

    class JudgingPanelService {
        -JudgingPanelRepository panelRepo
        -PanelAssignmentRepository assignmentRepo
        +createOrUpdate(PanelDTO) JudgingPanel
        +delete(Long) void
        +assignJudge(Long judgeId, AssignmentDTO) PanelAssignment
    }

    class ScoreService {
        -ScoreRepository scoreRepo
        -PanelAssignmentRepository assignmentRepo
        +submitScore(ScoreDTO, Long judgeId) Score
        +reviseScore(Long, ScoreDTO, Long judgeId) Score
        +getHistory(Long judgeId) List~Score~
    }

    class ScoringAggregationService {
        -ScoreRepository scoreRepo
        -VoteRepository voteRepo
        +combine(Long sessionId, Double judgeWeight, Double voteWeight) CombinedResultDTO
    }

    class AdminJudgeController {
        -JudgeService judgeService
        +addJudge(JudgeDTO) ResponseEntity
        +getJudge(Long) ResponseEntity
        +updateJudge(Long, JudgeDTO) ResponseEntity
        +deactivateJudge(Long) ResponseEntity
    }

    class AdminPanelController {
        -JudgingPanelService panelService
        +createPanel(PanelDTO) ResponseEntity
        +updatePanel(Long, PanelDTO) ResponseEntity
        +deletePanel(Long) ResponseEntity
        +assignJudge(Long, AssignmentDTO) ResponseEntity
    }

    class JudgeScoreController {
        -ScoreService scoreService
        +submitScore(ScoreDTO, JwtPrincipal) ResponseEntity
        +reviseScore(Long, ScoreDTO, JwtPrincipal) ResponseEntity
        +getHistory(JwtPrincipal) ResponseEntity
    }

    class AdminResultsController {
        -ScoringAggregationService aggregationService
        +getCombinedResults(Long sessionId) ResponseEntity
    }

    JudgingPanel "1" --> "*" PanelAssignment
    Judge "1" --> "*" PanelAssignment
    Judge "1" --> "*" Score

    JudgeRepository ..> Judge
    JudgingPanelRepository ..> JudgingPanel
    PanelAssignmentRepository ..> PanelAssignment
    ScoreRepository ..> Score

    JudgeService --> JudgeRepository
    JudgingPanelService --> JudgingPanelRepository
    JudgingPanelService --> PanelAssignmentRepository
    ScoreService --> ScoreRepository
    ScoreService --> PanelAssignmentRepository
    ScoringAggregationService --> ScoreRepository
    ScoringAggregationService --> VoteRepository

    AdminJudgeController --> JudgeService
    AdminPanelController --> JudgingPanelService
    JudgeScoreController --> ScoreService
    AdminResultsController --> ScoringAggregationService
```

---

### Module 6.6 — Customer Support & Complaint Management (Class Diagram)

```mermaid
classDiagram
    direction TB

    class SupportTicket {
        -Long id
        -Long userId
        -TicketCategory category
        -String subject
        -String description
        -TicketStatus status
        -LocalDateTime createdAt
        -LocalDateTime updatedAt
        +getters/setters()
    }

    class TicketResponse {
        -Long id
        -SupportTicket ticket
        -Long responderId
        -String message
        -LocalDateTime createdAt
        +getters/setters()
    }

    class Feedback {
        -Long id
        -Long userId
        -Long showId
        -Integer rating
        -String comment
        -LocalDateTime createdAt
        +getters/setters()
    }

    class Faq {
        -Long id
        -String question
        -String answer
        -Integer displayOrder
        -Boolean published
        +getters/setters()
    }

    class TicketCategory {
        <<enumeration>>
        COMPLAINT
        GENERAL
    }

    class TicketStatus {
        <<enumeration>>
        OPEN
        IN_PROGRESS
        RESOLVED
        CLOSED
    }

    class SupportTicketRepository {
        <<interface>>
        +findByUserId(Long) List~SupportTicket~
        +findByStatus(TicketStatus) List~SupportTicket~
        +findByCategory(TicketCategory) List~SupportTicket~
    }

    class TicketResponseRepository {
        <<interface>>
        +findByTicketId(Long) List~TicketResponse~
    }

    class FeedbackRepository {
        <<interface>>
        +findByUserId(Long) List~Feedback~
        +findByShowId(Long) List~Feedback~
    }

    class FaqRepository {
        <<interface>>
        +findByPublishedTrueOrderByDisplayOrder() List~Faq~
    }

    class SupportTicketService {
        -SupportTicketRepository ticketRepo
        -TicketResponseRepository responseRepo
        +submitTicket(TicketDTO, Long userId) SupportTicket
        +listTickets(TicketFilterCriteria) Page~SupportTicket~
        +getTicket(Long, Long userId) SupportTicket
        +updateStatus(Long, TicketStatus) SupportTicket
        +respond(Long, ResponseDTO) TicketResponse
    }

    class FeedbackService {
        -FeedbackRepository feedbackRepo
        +submit(FeedbackDTO, Long userId) Feedback
        +review(FeedbackFilterCriteria) Page~Feedback~
    }

    class FaqService {
        -FaqRepository faqRepo
        +createOrUpdate(FaqDTO) Faq
        +delete(Long) void
        +listPublished() List~Faq~
    }

    class SupportTicketController {
        -SupportTicketService ticketService
        -FeedbackService feedbackService
        +submitTicket(TicketDTO, JwtPrincipal) ResponseEntity
        +getTicket(Long, JwtPrincipal) ResponseEntity
        +submitFeedback(FeedbackDTO, JwtPrincipal) ResponseEntity
    }

    class AdminSupportController {
        -SupportTicketService ticketService
        -FeedbackService feedbackService
        +listTickets(FilterParams) ResponseEntity
        +updateTicketStatus(Long, StatusDTO) ResponseEntity
        +respond(Long, ResponseDTO) ResponseEntity
        +reviewFeedback(FilterParams) ResponseEntity
    }

    class AdminFaqController {
        -FaqService faqService
        +createOrUpdateFaq(FaqDTO) ResponseEntity
        +deleteFaq(Long) ResponseEntity
    }

    SupportTicket --> TicketCategory
    SupportTicket --> TicketStatus
    SupportTicket "1" --> "*" TicketResponse

    SupportTicketRepository ..> SupportTicket
    TicketResponseRepository ..> TicketResponse
    FeedbackRepository ..> Feedback
    FaqRepository ..> Faq

    SupportTicketService --> SupportTicketRepository
    SupportTicketService --> TicketResponseRepository
    FeedbackService --> FeedbackRepository
    FaqService --> FaqRepository

    SupportTicketController --> SupportTicketService
    SupportTicketController --> FeedbackService
    AdminSupportController --> SupportTicketService
    AdminSupportController --> FeedbackService
    AdminFaqController --> FaqService
```

---

### System-Wide Architecture Overview

```mermaid
classDiagram
    direction LR

    class ClientLayer {
        <<boundary>>
        Web Browser
        Mobile App
        API Client
    }

    class SecurityLayer {
        <<component>>
        JwtAuthenticationFilter
        JwtUtils
        SecurityConfig
        AuditLoggingAspect
    }

    class ControllerLayer {
        <<component>>
        AuthController
        AdminUserController
        AdminRoleController
        AdminShowController
        AdminSeasonController
        AdminEpisodeController
        AdminVotingSessionController
        AdminContestantController
        VoteController
        AdminComplianceController
        AdminAuditLogController
        AdminJudgeController
        AdminPanelController
        JudgeScoreController
        AdminResultsController
        SupportTicketController
        AdminSupportController
        AdminFaqController
    }

    class ServiceLayer {
        <<component>>
        AuthService
        UserService
        RoleService
        RealityShowService
        SeasonService
        EpisodeService
        VotingSessionService
        ContestantService
        FileStorageService
        VoteService
        ComplianceService
        AuditLogService
        JudgeService
        JudgingPanelService
        ScoreService
        ScoringAggregationService
        SupportTicketService
        FeedbackService
        FaqService
    }

    class RepositoryLayer {
        <<component>>
        UserRepository
        RoleRepository
        RefreshTokenRepository
        RealityShowRepository
        SeasonRepository
        EpisodeRepository
        VotingSessionRepository
        ContestantRepository
        VoteRepository
        AuditLogRepository
        JudgeRepository
        JudgingPanelRepository
        PanelAssignmentRepository
        ScoreRepository
        SupportTicketRepository
        TicketResponseRepository
        FeedbackRepository
        FaqRepository
    }

    class DatabaseLayer {
        <<database>>
        MySQL / PostgreSQL
    }

    ClientLayer --> SecurityLayer : HTTP + JWT
    SecurityLayer --> ControllerLayer : Authenticated Request
    ControllerLayer --> ServiceLayer : Business Logic
    ServiceLayer --> RepositoryLayer : Data Access
    RepositoryLayer --> DatabaseLayer : JPA / SQL
```

---

## User Review Required

> [!IMPORTANT]
> **Database Choice**: The plan assumes **PostgreSQL** as the primary database. If you prefer MySQL or another RDBMS, please confirm.

> [!IMPORTANT]
> **Module 6.0 (NEW)**: A full **Security & Authentication module** has been added with User entity, JWT login/register, refresh tokens, and full User + Role CRUD. This was not in the original six-module spec but is required as the foundation for all JWT-based security referenced throughout the system.

> [!WARNING]
> **File Storage for Photos**: Module 6.2 requires photo upload/storage. The plan uses local filesystem storage via `FileStorageService`. For production, consider cloud storage (S3, GCS). Please confirm if local storage is acceptable for the initial implementation.

## Open Questions

1. **Java version**: Should we target Java 17 or Java 21?
2. **Database**: PostgreSQL or MySQL?
3. **Scoring formula**: Module 6.5 references a "configurable weighting formula" for combining judge scores with audience votes. What is the default weight split (e.g., 50/50, 70/30)?
4. **Vote uniqueness constraint**: Is the duplicate-vote check per session (one vote per user per session) or per session per contestant (user can vote for different contestants in the same session)?
5. **Pagination**: Should list endpoints support pagination by default (Spring `Pageable`)?

---

## Proposed Changes

### Project Initialization

#### [NEW] Spring Boot Project

Initialize a Spring Boot 3.x project with:
- **Group**: `com.antivote`
- **Artifact**: `anti-vote`
- **Dependencies**: Spring Web, Spring Data JPA, Spring Security, Spring Validation, Lombok, PostgreSQL Driver, Spring AOP, jjwt (io.jsonwebtoken)

---

### Package Structure

```
com.antivote
├── config/
│   ├── SecurityConfig.java
│   ├── JwtAuthenticationFilter.java
│   └── JwtUtils.java
├── entity/
│   ├── User.java
│   ├── Role.java
│   ├── RefreshToken.java
│   ├── RealityShow.java
│   ├── Season.java
│   ├── Episode.java
│   ├── VotingSession.java
│   ├── Contestant.java
│   ├── Vote.java
│   ├── Judge.java
│   ├── JudgingPanel.java
│   ├── PanelAssignment.java
│   ├── Score.java
│   ├── AuditLog.java
│   ├── SupportTicket.java
│   ├── TicketResponse.java
│   ├── Feedback.java
│   └── Faq.java
├── enums/
│   ├── ShowStatus.java
│   ├── SessionStatus.java
│   ├── ContestantStatus.java
│   ├── TicketCategory.java
│   └── TicketStatus.java
├── dto/
│   ├── auth/
│   │   ├── RegisterDTO.java
│   │   ├── LoginDTO.java
│   │   ├── JwtResponseDTO.java
│   │   ├── TokenRefreshDTO.java
│   │   ├── UserDTO.java
│   │   ├── RoleDTO.java
│   │   └── PasswordDTO.java
│   ├── (request/response DTOs per module)
├── repository/
│   ├── UserRepository.java
│   ├── RoleRepository.java
│   ├── RefreshTokenRepository.java
│   ├── RealityShowRepository.java
│   ├── SeasonRepository.java
│   ├── EpisodeRepository.java
│   ├── VotingSessionRepository.java
│   ├── ContestantRepository.java
│   ├── VoteRepository.java
│   ├── JudgeRepository.java
│   ├── JudgingPanelRepository.java
│   ├── PanelAssignmentRepository.java
│   ├── ScoreRepository.java
│   ├── AuditLogRepository.java
│   ├── SupportTicketRepository.java
│   ├── TicketResponseRepository.java
│   ├── FeedbackRepository.java
│   └── FaqRepository.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── RoleService.java
│   ├── RealityShowService.java
│   ├── SeasonService.java
│   ├── EpisodeService.java
│   ├── VotingSessionService.java
│   ├── ContestantService.java
│   ├── FileStorageService.java
│   ├── VoteService.java
│   ├── ComplianceService.java
│   ├── AuditLogService.java
│   ├── JudgeService.java
│   ├── JudgingPanelService.java
│   ├── ScoreService.java
│   ├── ScoringAggregationService.java
│   ├── SupportTicketService.java
│   ├── FeedbackService.java
│   ├── FaqService.java
│   └── ReportService.java
├── controller/
│   ├── auth/
│   │   └── AuthController.java
│   ├── admin/
│   │   ├── AdminUserController.java
│   │   ├── AdminRoleController.java
│   │   ├── AdminShowController.java
│   │   ├── AdminSeasonController.java
│   │   ├── AdminEpisodeController.java
│   │   ├── AdminVotingSessionController.java
│   │   ├── AdminContestantController.java
│   │   ├── AdminComplianceController.java
│   │   ├── AdminAuditLogController.java
│   │   ├── AdminJudgeController.java
│   │   ├── AdminPanelController.java
│   │   ├── AdminResultsController.java
│   │   ├── AdminReportController.java
│   │   ├── AdminSupportController.java
│   │   └── AdminFaqController.java
│   └── viewer/
│       ├── VoteController.java
│       ├── JudgeScoreController.java
│       └── SupportTicketController.java
├── aspect/
│   └── AuditLoggingAspect.java
└── exception/
    ├── GlobalExceptionHandler.java
    ├── ResourceNotFoundException.java
    ├── InvalidStateException.java
    ├── DuplicateVoteException.java
    └── AuthenticationException.java
```

---

### Module 6.0 — Security & Authentication (NEW)

This is the **foundational module** that all other modules depend on for JWT authentication and role-based access.

#### [NEW] `User.java`
JPA entity mapped to `users` table. Fields: `id`, `username`, `email`, `password` (BCrypt hashed), `enabled`, `createdAt`, `updatedAt`. Many-to-many relationship with `Role` via `user_roles` join table.

#### [NEW] `Role.java`
JPA entity mapped to `roles` table. Fields: `id`, `name`, `permissions` (element collection). Predefined roles: `ADMIN`, `REALITY_SHOW_MANAGER`, `CONTESTANT_STAFF`, `SECURITY_OFFICER`, `JUDGE`, `SUPPORT_STAFF`, `VIEWER`.

#### [NEW] `RefreshToken.java`
JPA entity for JWT refresh token rotation. Fields: `id`, `user` (FK), `token`, `expiryDate`.

#### [NEW] `UserRepository.java`, `RoleRepository.java`, `RefreshTokenRepository.java`
Spring Data JPA interfaces with finders by username, email, token, and role name.

#### [NEW] `AuthService.java`
Registration (with duplicate username/email check), login (BCrypt verify → JWT issue), token refresh, and logout (revoke refresh token).

#### [NEW] `UserService.java`
Full User CRUD for admins: create, get, list (paginated), update, delete, toggle enabled, assign/remove roles, change password.

#### [NEW] `RoleService.java`
Full Role CRUD: create, get, list, update, delete, update permissions.

#### [NEW] `JwtUtils.java`
JWT generation, validation, and claim extraction using `io.jsonwebtoken` (jjwt).

#### [NEW] `JwtAuthenticationFilter.java`
OncePerRequestFilter that extracts JWT from `Authorization: Bearer <token>` header, validates it, and sets the SecurityContext.

#### [NEW] `SecurityConfig.java`
Spring Security configuration: stateless session, JWT filter registration, endpoint-level access rules, BCrypt password encoder, CORS config.

#### [NEW] `AuthController.java`
Public endpoints (no auth required):

| # | Endpoint | Method | Description |
|---|---|---|---|
| 1 | `POST /auth/register` | Register | Creates new user with default VIEWER role |
| 2 | `POST /auth/login` | Login | Returns JWT access token + refresh token |
| 3 | `POST /auth/refresh` | Refresh | Issues new access token using refresh token |
| 4 | `POST /auth/logout` | Logout | Revokes refresh token (requires auth) |

#### [NEW] `AdminUserController.java`
Admin-only endpoints (`ADMIN` role required):

| # | Endpoint | Method | Description |
|---|---|---|---|
| 1 | `POST /admin/users` | Create | Admin creates user with specific roles |
| 2 | `GET /admin/users` | List | Paginated user listing with filters |
| 3 | `GET /admin/users/{id}` | Read | Single user profile with roles |
| 4 | `PUT /admin/users/{id}` | Update | Edit user details (username, email) |
| 5 | `DELETE /admin/users/{id}` | Delete | Hard-delete user (blocked if has votes/tickets) |
| 6 | `PATCH /admin/users/{id}/toggle` | Toggle | Enable/disable user account |
| 7 | `POST /admin/users/{id}/roles` | Assign Role | Adds a role to the user |
| 8 | `DELETE /admin/users/{id}/roles/{roleId}` | Remove Role | Removes a role from the user |
| 9 | `PATCH /admin/users/{id}/password` | Reset Password | Admin resets a user's password |

#### [NEW] `AdminRoleController.java`
Admin-only endpoints (`ADMIN` role required):

| # | Endpoint | Method | Description |
|---|---|---|---|
| 1 | `POST /admin/roles` | Create | Creates a new role |
| 2 | `GET /admin/roles` | List | Lists all roles |
| 3 | `GET /admin/roles/{id}` | Read | Role details with permissions |
| 4 | `PUT /admin/roles/{id}` | Update | Edit role name |
| 5 | `DELETE /admin/roles/{id}` | Delete | Deletes role (blocked if assigned to users) |
| 6 | `PUT /admin/roles/{id}/permissions` | Update Permissions | Sets the permission set for a role |

**Total Module 6.0 Endpoints: 19**

---

### Module 6.1 — Reality Show Management

#### [NEW] `RealityShow.java`, `Season.java`, `Episode.java`, `VotingSession.java`
JPA entities mapped to `reality_shows`, `seasons`, `episodes`, `voting_sessions` tables.

#### [NEW] `RealityShowRepository.java`, `SeasonRepository.java`, `EpisodeRepository.java`, `VotingSessionRepository.java`
Spring Data JPA interfaces with custom finders.

#### [NEW] `RealityShowService.java`, `SeasonService.java`, `EpisodeService.java`, `VotingSessionService.java`
Business logic including status transitions (DRAFT→ACTIVE→COMPLETED→ARCHIVED), validation of date ranges, cascade deletion guards.

#### [NEW] `AdminShowController.java`, `AdminSeasonController.java`, `AdminEpisodeController.java`, `AdminVotingSessionController.java`
REST controllers secured with `@PreAuthorize("hasRole('ADMIN') or hasRole('REALITY_SHOW_MANAGER')")`.

**Endpoints**: 8 endpoints as specified (POST/PUT/DELETE/PATCH for shows, seasons, episodes, voting sessions).

---

### Module 6.2 — Contestant Management

#### [NEW] `Contestant.java`
Entity with FK to `reality_shows` and `seasons`, status enum, photo path.

#### [NEW] `ContestantRepository.java`
Finders by show, season, and status.

#### [NEW] `ContestantService.java`, `FileStorageService.java`
Contestant CRUD + soft-delete logic. File storage for photo uploads with content-type and size validation.

#### [NEW] `AdminContestantController.java`
7 endpoints for contestant lifecycle including photo upload via `@RequestPart`.

---

### Module 6.3 — Voting & Voting Session Management

#### [NEW] `Vote.java`
Entity with unique constraint on `(session_id, user_id)` to prevent duplicate votes at DB level.

#### [NEW] `VoteRepository.java`
Custom queries for vote counts, duplicate detection, and per-session aggregation.

#### [NEW] `VoteService.java`
Validation logic: session must be OPEN, user hasn't exceeded `maxVotesPerUser`, contestant belongs to the session's episode. User ID derived from JWT, not client input.

#### [NEW] `VoteController.java`
Viewer-facing endpoints for casting votes and retrieving confirmation receipts.

**Endpoints**: 9 sub-functions (6 admin session management + 3 viewer vote operations).

---

### Module 6.4 — Voting Compliance & Security (EXPANDED)

> [!NOTE]
> Role CRUD is handled by `AdminRoleController` in Module 6.0. This module focuses on **compliance monitoring, audit trail, and voting integrity** — the security-officer-facing operations.

#### [NEW] `AuditLog.java`
Entity for immutable audit trail. Fields: `id`, `actor`, `action`, `entityType`, `entityId`, `details`, `ipAddress`, `timestamp`.

#### [NEW] `AuditLogRepository.java`
Extended Spring Data JPA interface with finders by actor, entity, action, timestamp range, plus count queries for reporting.

#### [NEW] `ComplianceService.java`
Anomaly detection (IP-based spike analysis), integrity verification (count reconciliation), compliance report generation.

#### [NEW] `AuditLogService.java`
Full audit log management: auto-log via aspect, search/filter, get by ID, get by entity, purge old entries, export.

#### [NEW] `AuditLoggingAspect.java`
`@Aspect` that intercepts all admin write operations, voting actions, and auth events to emit `AuditLog` entries automatically.

#### [NEW] `AdminComplianceController.java`
Compliance monitoring endpoints:

| # | Endpoint | Method | Description |
|---|---|---|---|
| 1 | `GET /admin/compliance/activity` | Read | Near-real-time voting throughput and per-contestant counts |
| 2 | `GET /admin/compliance/anomalies` | Read | Flags IP-based vote spikes and suspicious patterns |
| 3 | `GET /admin/compliance/verify/{sessionId}` | Read | Reconciles stored counts vs raw vote records |
| 4 | `GET /admin/compliance/reports/{sessionId}` | Read | Audit-ready compliance report for a session |

#### [NEW] `AdminAuditLogController.java`
Full audit log CRUD endpoints:

| # | Endpoint | Method | Description |
|---|---|---|---|
| 1 | `GET /admin/audit-logs` | List | Paginated, filterable list of all audit entries |
| 2 | `GET /admin/audit-logs/{id}` | Read | Single audit log entry by ID |
| 3 | `GET /admin/audit-logs/entity/{type}/{entityId}` | Read | All audit entries for a specific entity |
| 4 | `DELETE /admin/audit-logs/purge` | Purge | Deletes audit entries older than a given date |
| 5 | `GET /admin/audit-logs/export` | Export | Downloads filtered audit log as CSV/JSON |

**Total Module 6.4 Endpoints: 9** (4 compliance + 5 audit log)

---

### Module 6.5 — Judge & Panel Management

#### [NEW] `Judge.java`, `JudgingPanel.java`, `PanelAssignment.java`, `Score.java`
Entities modeling judges, panels, assignments, and scores.

#### [NEW] `ScoreService.java`, `ScoringAggregationService.java`
Score submission with panel-assignment authorization checks. Configurable weighted aggregation of judge scores + audience votes.

#### [NEW] `JudgeScoreController.java`
Judge-facing endpoints secured to only allow scoring within assigned panels.

**Endpoints**: 11 sub-functions across 4 controllers.

---

### Module 6.6 — Customer Support & Complaint Management

#### [NEW] `SupportTicket.java`, `TicketResponse.java`, `Feedback.java`, `Faq.java`
Entities for ticket lifecycle, staff responses, user feedback, and FAQ content.

#### [NEW] `SupportTicketService.java`, `FeedbackService.java`, `FaqService.java`
Ticket state machine (OPEN→IN_PROGRESS→RESOLVED→CLOSED), ownership checks against JWT subject.

#### [NEW] `SupportTicketController.java`, `AdminSupportController.java`, `AdminFaqController.java`
7 sub-functions with viewer self-service and admin management endpoints.

---

### Cross-Cutting Concerns

#### [NEW] `SecurityConfig.java`, `JwtAuthenticationFilter.java`
Spring Security configuration with JWT validation, role-based endpoint protection.

#### [NEW] `GlobalExceptionHandler.java`
`@ControllerAdvice` for consistent error responses (400, 403, 404, 409, 500).

#### [NEW] `application.yml`
Database connection, JWT secret, file upload limits, server port configuration.

---

## Verification Plan

### Automated Tests
- **Unit tests** for every Service class using Mockito:
  ```bash
  mvn test -pl . -Dtest="*ServiceTest"
  ```
- **Integration tests** for Repository layer with `@DataJpaTest`:
  ```bash
  mvn test -pl . -Dtest="*RepositoryTest"
  ```
- **Controller tests** with `@WebMvcTest` and MockMvc:
  ```bash
  mvn test -pl . -Dtest="*ControllerTest"
  ```
- **Full build**:
  ```bash
  mvn clean verify
  ```

### Manual Verification
- Test all 50+ endpoints via Postman/Insomnia collection
- Verify JWT authentication and role-based access control
- Test voting flow end-to-end: create show → season → episode → session → open → cast vote → confirm → close
- Verify audit log entries are created for all admin operations
- Test file upload with valid/invalid content types and sizes
